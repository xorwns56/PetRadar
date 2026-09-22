import { client } from "./client";

export const fetchMe = () => client.get("/api/user/me").then((r) => r.data);

export const updateMe = ({ pw, hp }) => client.patch("/api/user/me", { pw, hp });

export const deleteMe = () => client.delete("/api/user/me");
