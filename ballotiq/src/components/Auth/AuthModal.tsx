"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { signInWithGoogle, createAccount, getFirebaseAuth } from "@/lib/firebase/client";
import { captureEvent } from "@/lib/posthog/helper";
import { EVENTS } from "@/lib/posthog/events";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (auth?.currentUser) {
      setIsAnonymous(auth.currentUser.isAnonymous);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      onClose();
    } catch (error: unknown) {
      console.error("Authentication failed:", error);
      const firebaseError = error as { code?: string; message?: string };
      captureEvent(EVENTS.FIREBASE_ERROR, { context: 'google_sign_in', error_code: firebaseError.code });

      if (firebaseError.code === "auth/email-already-in-use") {
        alert("This email already has an account. Please sign in instead.");
      } else if (firebaseError.code === "auth/credential-already-in-use") {
        alert("This Google account is already linked to another BallotIQ user.");
      } else {
        alert(firebaseError.message || "Authentication failed");
      }
    }
  };

  const handleCreateAccount = async () => {
    try {
      if (!email.trim()) {
        alert("Please enter an email");
        return;
      }

      if (password.length < 6) {
        alert("Password must be at least 6 characters");
        return;
      }

      if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
      }

      await createAccount(email, password);

      alert(isAnonymous ? "Progress saved successfully!" : "Account created successfully!");
      onClose();
    } catch (error: unknown) {
      console.error("Account creation failed:", error);
      const firebaseError = error as { code?: string; message?: string };
      captureEvent(EVENTS.FIREBASE_ERROR, { context: 'create_account', error_code: firebaseError.code });
      if (firebaseError.code === "auth/email-already-in-use") {
        alert("This email already has an account. Please sign in instead.");
      } else {
        alert("Failed to create account: " + (firebaseError.message || "Unknown error"));
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="w-full max-w-md rounded-3xl bg-[#080815] border border-white/10 p-8 text-center relative overflow-hidden">
        {isAnonymous && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
        )}
        
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
            <ShieldCheck className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-3">
          {isAnonymous ? "Save Your Progress" : "Welcome to BallotIQ"}
        </h2>

        {!showCreateAccount ? (
          <>
            <p className="text-gray-400 mb-6">
              {isAnonymous 
                ? "Upgrade to a permanent account to ensure your learning history, quiz results, and personalized guides are never lost."
                : "Sign in or create an account to save your progress and personalize your learning experience."}
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleGoogleSignIn}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition flex items-center justify-center gap-2"
              >
                <span>Continue with Google</span>
              </button>

              <button
                onClick={() => setShowCreateAccount(true)}
                className="w-full py-3 rounded-xl bg-white/5 text-white font-semibold hover:bg-white/10 transition"
              >
                {isAnonymous ? "Save with Email" : "Create Account"}
              </button>

              <button
                onClick={onClose}
                className="mt-2 text-sm text-gray-500 hover:text-gray-300"
              >
                Continue as Guest
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-400 mb-6">
              {isAnonymous ? "Link your email to save progress" : "Create your BallotIQ account"}
            </p>

            <div className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white outline-none focus:border-blue-500/50 transition-colors"
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 pr-12 text-white outline-none focus:border-blue-500/50 transition-colors"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 pr-12 text-white outline-none focus:border-blue-500/50 transition-colors"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              <button
                onClick={handleCreateAccount}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition"
              >
                {isAnonymous ? "Save Progress" : "Create Account"}
              </button>

              <button
                onClick={() => setShowCreateAccount(false)}
                className="text-sm text-gray-400 hover:text-white"
              >
                Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

