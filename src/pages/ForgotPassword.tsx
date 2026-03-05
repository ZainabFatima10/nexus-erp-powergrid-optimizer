import { useState } from "react";
import { Link } from "react-router-dom";
import NexusLogo from "@/components/NexusLogo";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background grid-bg relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-1/3 left-1/3 w-80 h-80 rounded-full bg-primary/5 blur-[120px] animate-pulse-glow" />
      </div>

      <div className="glass-card p-8 w-full max-w-md mx-4 glow-cyan animate-slide-up relative z-10">
        <div className="flex justify-center mb-8">
          <NexusLogo size="large" />
        </div>

        {!sent ? (
          <>
            <h2 className="text-xl font-heading font-bold text-center mb-2">Forgot Password</h2>
            <p className="text-sm text-muted-foreground text-center mb-6">Enter your email to receive a reset link.</p>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" style={{ borderRadius: 20 }}
                  placeholder="admin@nexus.com"
                />
              </div>
              <button type="submit" className="w-full py-2.5 rounded-lg gradient-btn text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all">
                <Mail size={18} />
                Send Reset Link
              </button>
            </form>
          </>
        ) : (
          <div className="text-center animate-slide-up">
            <CheckCircle size={48} className="mx-auto text-success mb-4" />
            <h2 className="text-xl font-heading font-bold mb-2">Reset Link Sent</h2>
            <p className="text-sm text-muted-foreground mb-6">We've sent a password reset link to <strong className="text-foreground">{email}</strong>.</p>
          </div>
        )}

        <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm text-primary hover:underline mt-6">
          <ArrowLeft size={14} />
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
