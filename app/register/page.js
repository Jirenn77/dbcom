"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Toaster, toast } from "sonner";
import ReCAPTCHA from "react-google-recaptcha";

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [captchaToken, setCaptchaToken] = useState(null);
    const [error, setError] = useState("");
    const router = useRouter();

    const sanitizeInput = (input) => {
        return input.replace(/[<>/';\"(){}]/g, "").trim();
    };

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const validatePassword = (password) => {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const cleanEmail = sanitizeInput(email);
        const cleanPassword = sanitizeInput(password);
        const cleanConfirmPassword = sanitizeInput(confirmPassword);

        if (!validateEmail(cleanEmail)) {
            toast.error("Invalid email format");
            return;
        }

        if (!validatePassword(cleanPassword)) {
            toast.error("Password must be at least 8 characters long, include uppercase, lowercase, a number, and a special character.");
            return;
        }

        if (cleanPassword !== cleanConfirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (!captchaToken) {
            toast.error("Please complete the CAPTCHA");
            return;
        }

        try {
            const res = await axios.post(
                "http://localhost/API/getBalance.php?action=register",
                { email: cleanEmail, password: cleanPassword, role: "customer", captchaToken },
                { headers: { "Content-Type": "application/json" } }
            );

            if (res.data.success) {
                toast.success("Registration successful! You can now log in.");
                router.push("/");
            } else {
                setError(res.data.error || "Registration failed");
                toast.error(res.data.error || "Registration failed. Please try again.");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
            toast.error("An error occurred. Please try again.");
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gradient-to-br from-lime-200 via-lime-300 to-lime-400 p-6">
            <Toaster />
            <div className="bg-white bg-opacity-90 rounded-2xl shadow-lg p-10 max-w-md w-full">
                <h1 className="text-3xl font-bold mb-6 text-center text-lime-600">Sign Up</h1>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 rounded-lg bg-lime-100 border border-lime-300 focus:ring-2 focus:ring-lime-500 placeholder-gray-600 text-gray-800"
                            placeholder="Email"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 rounded-lg bg-lime-100 border border-lime-300 focus:ring-2 focus:ring-lime-500 placeholder-gray-600 text-gray-800"
                            placeholder="Password"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full p-3 rounded-lg bg-lime-100 border border-lime-300 focus:ring-2 focus:ring-lime-500 placeholder-gray-600 text-gray-800"
                            placeholder="Confirm Password"
                            required
                        />
                    </div>
                    <div className="mb-4 flex justify-center">
                        <ReCAPTCHA
                            sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // Replace with your actual site key
                            onChange={(token) => setCaptchaToken(token)}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 bg-lime-600 hover:bg-lime-500 text-white rounded-lg font-bold transition-all text-sm"
                    >
                        Sign Up
                    </button>
                </form>
                <div className="mt-4 text-center text-gray-600">
                    Already have an account?{" "}
                    <button
                        onClick={() => router.push("/")}
                        className="text-lime-600 hover:underline text-sm"
                    >
                        Click here
                    </button>
                </div>
            </div>
        </div>
    );
}