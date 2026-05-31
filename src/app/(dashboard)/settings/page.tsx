"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Settings, User, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(session?.user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        await update({ name });
        toast({ title: "Profile updated", description: "Your name has been updated." });
      } else {
        toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast({ title: "Error", description: "Please fill in all password fields.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: "Error", description: "New password must be at least 8 characters.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (res.ok) {
        toast({ title: "Password changed", description: "Your password has been updated." });
        setCurrentPassword("");
        setNewPassword("");
      } else {
        const data = await res.json();
        toast({ title: "Error", description: data.error || "Failed to change password.", variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="h-6 w-6 text-violet-400" />
          Settings
        </h1>
        <p className="text-sm text-white/50 mt-0.5">Manage your account settings</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4 text-violet-400" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src={session?.user?.image || ""} />
              <AvatarFallback className="text-lg">
                {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-white">{session?.user?.name}</p>
              <p className="text-sm text-white/50">{session?.user?.email}</p>
              <Badge
                variant={session?.user?.role === "FREE" ? "secondary" : "pro"}
                className="mt-1 text-xs"
              >
                {session?.user?.role} Plan
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                value={session?.user?.email || ""}
                disabled
                className="opacity-50"
              />
              <p className="text-xs text-white/30">Email cannot be changed</p>
            </div>

            <Button onClick={handleUpdateProfile} disabled={loading} size="sm">
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : null}
              Save Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-violet-400" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="Minimum 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <Button onClick={handleChangePassword} disabled={loading} size="sm" variant="outline">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : null}
            Change Password
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-red-400">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Delete Account</p>
              <p className="text-xs text-white/50">Permanently delete your account and all data</p>
            </div>
            <Button variant="destructive" size="sm" disabled>
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
