import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "../components/shared/Button";
import { Input } from "../components/shared/Input";
import { register } from "../services/auth.service";
import { useAuthStore } from "../store/authStore";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async () => {
    const user = await register(username, email, password);
    setUser(user);
    navigate("/sessions");
  };

  return (
    <main className="mx-auto mt-10 max-w-md rounded-2xl bg-white p-6 shadow-xl">
      <h2 className="mb-4 font-display text-2xl font-bold">Create Account</h2>
      <div className="space-y-3">
        <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button className="w-full" onClick={() => void submit()}>
          Register
        </Button>
      </div>
      <p className="mt-3 text-sm">
        Already registered? <Link to="/login" className="text-coral">Log in</Link>
      </p>
    </main>
  );
};
