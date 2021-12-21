import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';

async function main() {
  const app = await NestFactory.create(AppModule, {cors: true});
  await app.listen(17001);
}

main();
