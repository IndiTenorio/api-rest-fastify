import { server } from "./app";
import { env } from "./env";

server.listen({ port: env.PORT }, () => {
  console.log(`listening at http://localhost:${env.PORT}`);
});
