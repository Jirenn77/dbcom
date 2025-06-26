"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Toaster, toast } from "sonner";
import './globals.css'; // adjust the path if necessary


export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [captcha, setCaptcha] = useState("");
    const [captchaQuestion, setCaptchaQuestion] = useState("");
    const [correctCaptchaAnswer, setCorrectCaptchaAnswer] = useState(0);
    const [error, setError] = useState("");
    const [loginAttempts, setLoginAttempts] = useState(0);
    const MAX_ATTEMPTS = 5;
    const router = useRouter();

    useEffect(() => {
        generateCaptcha();
    }, []);

    const generateCaptcha = () => {
        let num1 = Math.floor(Math.random() * 10); 
        let num2 = Math.floor(Math.random() * 10); 
        setCorrectCaptchaAnswer(num1 + num2);
        setCaptchaQuestion(`${num1} + ${num2} = ?`);
    };

    const sanitizeInput = (input) => {
        return input.replace(/[<>/'";(){}]/g, "").trim();
    };

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loginAttempts >= MAX_ATTEMPTS) {
            toast.error("Too many failed attempts. Please try again later.");
            return;
        }

        let sanitizedEmail = sanitizeInput(email);
        if (!validateEmail(sanitizedEmail)) {
            toast.error("Invalid email format.");
            return;
        }

        if (parseInt(captcha) !== correctCaptchaAnswer) {
            toast.error("Incorrect CAPTCHA answer. Try again.");
            generateCaptcha();
            return;
        }

        try {
            const res = await axios.post(
                "https://localhost/API/getBalance.php?action=login",
                new URLSearchParams({ email: sanitizedEmail, password })
            );

            if (res.data.role) {
                toast.success("Login successful!");
                localStorage.setItem("loginAttempts", 0);
                router.push(res.data.role === "admin" ? "/home" : "/customer-home");
            } else {
                setLoginAttempts(prev => {
                    const newAttempts = prev + 1;
                    localStorage.setItem("loginAttempts", newAttempts);
                    return newAttempts;
                });
                toast.error("Login failed. Please try again.");
            }
        } catch (err) {
            toast.error("An error occurred. Please try again.");
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gradient-to-br from-lime-200 via-lime-300 to-lime-400 p-6">
            <Toaster />
            <div className="bg-white bg-opacity-90 rounded-2xl shadow-lg p-10 max-w-md w-full">
                <h1 className="text-3xl font-bold mb-6 text-center text-lime-600">Login</h1>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 rounded-lg bg-lime-100 border border-lime-300 focus:ring-2 focus:ring-lime-500 placeholder-gray-600 text-gray-700"
                            placeholder="Email"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 rounded-lg bg-lime-100 border border-lime-300 focus:ring-2 focus:ring-lime-500 placeholder-gray-600 text-gray-700"
                            placeholder="Password"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">{captchaQuestion}</label>
                        <input
                            type="text"
                            value={captcha}
                            onChange={(e) => setCaptcha(e.target.value)}
                            className="w-full p-3 rounded-lg bg-lime-100 border border-lime-300 focus:ring-2 focus:ring-lime-500 placeholder-gray-600 text-gray-700"
                            placeholder="Enter the answer"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 bg-lime-600 hover:bg-lime-500 text-white rounded-lg font-bold transition-all text-sm"
                    >
                        Login
                    </button>
                </form>
                <div className="mt-4 text-center text-gray-600">
                    Need an account?{" "}
                    <button
                        onClick={() => router.push("/register")}
                        className="text-lime-600 hover:underline text-sm"
                    >
                        Sign up here
                    </button>
                </div>
            </div>
        </div>
    );
}
