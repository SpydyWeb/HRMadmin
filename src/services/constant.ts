import { env } from "@/env";

export const APIRoutes = {
  APIBASEURL:env.VITE_API_URL.toString(),
  LOGIN: 'Auth/Login',

}