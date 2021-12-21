from src.broadcast_server import BroadcastServer


class AppDelegate(object):

  def __init__(self):
    super(AppDelegate, self).__init__()

  def run(self):
    stream_server = BroadcastServer('srlab')
    return stream_server.run()


if __name__ == '__main__':
  app = AppDelegate()
  exit(app.run())
