import { Login } from "@/types/login.types";
import { User } from "@/types/user.types";

const userLogin = async (values: Login): Promise<boolean> => {
  const apiRes = await fetch("/api/login", {
    method: "POST",
    body: JSON.stringify(values),
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!apiRes.ok) throw new Error("An error occurred when login user.");
  return true;
};

const userLogout = async (): Promise<boolean> => {
  const apiRes = await fetch("/api/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!apiRes.ok) throw new Error("An error occurred when logout.");
  return true;
};

const getUserAfterAuth = async (): Promise<User> => {
  const apiRes = await fetch("/api/get-user-auth", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!apiRes.ok) throw new Error("An error occurred when fetching user.");
  return await apiRes.json();
};

export { userLogin, userLogout, getUserAfterAuth };
