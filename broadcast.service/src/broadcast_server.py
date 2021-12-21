import io
import re
import cv2
import jwt
import numpy as np
import torch
import base64
import asyncio
import websockets
import matplotlib.patches as patches
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import urlparse, parse_qs
from matplotlib import pyplot as plt
from .od_attack import YOLOv5VanishAttack


def infer_result_to_list(y_pred: torch.Tensor) -> List:
  infer_result = []
  for i in range(len(y_pred)):
    x1, y1, x2, y2, confidence_score, label = y_pred[i].detach().cpu()
    infer_result.append([int(x1.item()), int(y1.item()), int(x2.item()), int(y2.item()), confidence_score.item(), int(label.item())])
  return infer_result


class WebSocketServerProtocolWrapper(websockets.WebSocketServerProtocol):

  def __init__(self, *args, **kargs):
    super().__init__(*args, **kargs)

    self._params: Dict[str, str]

  async def process_request(self, path, headers):
    params = parse_qs(urlparse(path).query)
    if len(params) != 0:
      keys, values = zip(*params.items())
      params = dict(zip(map(lambda k: k.lower(), keys), map(lambda v: v[0], values)))

    self._params = params

  def has_param(self, key: str) -> bool:
    return key in self._params

  def get_param(self, key: str) -> Optional[str]:
    return self._params[key]


class BroadcastServer(object):

  def __init__(self, authentication_key: str):
    super(BroadcastServer, self).__init__()

    self.__authentication_key: str = authentication_key
    self.__host: WebSocketServerProtocolWrapper = None
    self.__viewers: List[WebSocketServerProtocolWrapper] = []
    self.__yolov5 = torch.hub.load('ultralytics/yolov5', 'yolov5s', pretrained=True).eval()
    self.__attacker = YOLOv5VanishAttack(model=self.__yolov5, conf_thres=0.15, iou_thres=0.8, alpha=0.005, eps=0.02, max_iter=6)

  async def __authenticate(self, ws: websockets.WebSocketServerProtocol, timeout: float = 1.0) -> Tuple[Any, Dict[str, Any]]:
    payload = None

    try:
      token = (await asyncio.wait_for(ws.recv(), timeout=timeout)).split('.')
      if (len(token) == 3) and all([re.match(r'^[0-9A-Za-z=\-_]+$', partition) is not None
                                    for partition in token]):
        payload = jwt.decode('.'.join(token), self.__authentication_key, algorithms=['HS256'])
    except asyncio.TimeoutError:
      pass
    except jwt.InvalidTokenError:
      pass

    return (ws, payload)

  async def __handler(self, ws: WebSocketServerProtocolWrapper):
    ws, payload = await self.__authenticate(ws)
    if payload is None:
      await ws.close(1011, 'authentication failed')
      return

    if (not ws.has_param('role')) or (ws.get_param('role') not in ['host', 'viewer']):
      await ws.close(1011, 'invalid role')
      return

    if ws.get_param('role') == 'host':
      if self.__host is not None:
        self.__host.close()
      self.__host = ws
    else:
      self.__viewers.append(ws)

    while not ws.closed:
      await asyncio.sleep(1.0)

  async def __listen(self) -> int:
    async with websockets.serve(self.__handler, '192.168.1.15', 17002,
                                create_protocol=WebSocketServerProtocolWrapper):
      is_eagerd, n_waits = False, 0
      while True:
        try:
          if self.__host is not None:
            if not is_eagerd:
              is_eagerd = True
              print('IDLE ...')
              await self.__host.send('M     IDLE')
            else:
              try:
                img = await asyncio.wait_for(self.__host.recv(), 1.0 / 22)
                img = img[len('data:image/png;base64,'):]
                img = np.fromstring(base64.b64decode(img), np.uint8)
                img = cv2.imdecode(img, cv2.IMREAD_COLOR)
                img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

                x = torch.FloatTensor(img) / 255
                x = x.permute(2, 0, 1).unsqueeze(0)
                x_adv, infer_results = self.__attacker(x, verbose=False)

                x = x.squeeze()
                x_adv = x_adv.detach().squeeze().cpu()
                x_perturb = x_adv - x
                x_perturb = (x_perturb / self.__attacker.eps).add(1).div(2).clip(0, 1)

                x_adv = torch.concat([x, x_adv, x_perturb], axis=-1)
                x_adv = x_adv.permute(1, 2, 0).numpy()

                fig, ax = plt.subplots(figsize=(9, 9))
                ax.imshow(x_adv)

                y_pred = infer_results[0]
                for i in range(len(y_pred)):
                    x1, y1, x2, y2, confidence_score, label = y_pred[i].detach().cpu()
                    ax.add_patch(patches.Rectangle((x1, y1), x2 - x1, y2 - y1,
                                                   fill=False, linewidth=3, edgecolor='y'))
                    ax.text(x1, y1,
                            f'{label:.0f} {confidence_score:.2f}',
                            color='black', fontsize=12, backgroundcolor='y')

                y_pred = infer_results[-1]
                for i in range(len(y_pred)):
                    x1, y1, x2, y2, confidence_score, label = y_pred[i].detach().cpu()
                    ax.add_patch(patches.Rectangle((640 + x1, y1), 640 + x2 - x1, y2 - y1,
                                                   fill=False, linewidth=3, edgecolor='y'))
                    ax.text(640 + x1, y1,
                            f'{label:.0f} {confidence_score:.2f}',
                            color='black', fontsize=12, backgroundcolor='y')

                ax.set_xticks([])
                ax.set_yticks([])

                buf = io.BytesIO()
                plt.savefig(buf, format='png', bbox_inches='tight')
                plt.close()
                buf.seek(0)
                img = base64.b64encode(buf.read())
                img = img.decode('utf-8')

                for viewer in self.__viewers:
                  await viewer.send(img)

                print('--- OD AE generated ---')
                is_eagerd, n_waits = False, 0
              except asyncio.TimeoutError:
                if n_waits < 22:
                  n_waits += 1
                else:
                  is_eagerd, n_waits = False, 0
          else:
            await asyncio.tasks.sleep(1.0 / 22)
        except websockets.exceptions.ConnectionClosedError:
          self.__host = None
        except websockets.exceptions.ConnectionClosedOK:
          self.__host = None

  def run(self) -> int:
    ctx = asyncio.get_event_loop()
    ret = ctx.run_until_complete(self.__listen())
    ctx.close()
    return ret
