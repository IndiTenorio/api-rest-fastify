import { server } from "./app";
import { env } from "./env";

server.listen({ port: env.PORT, host: "0.0.0.0" }, () => {
  console.log(`listening at http://localhost:${env.PORT}`);
});
