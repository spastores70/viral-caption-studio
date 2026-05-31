"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Settings, User, Shield, Loader2, ChevronRight } from "lucide-react";
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
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [name, setName] = useState(session?.user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleUpdateProfile = async () => {
    setSaving(true);
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
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast({ title: "Error", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: "Error", description: "New password must be at least 8 characters.", variant: "destructive" });
      return;
    }
    setChangingPassword(true);
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
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-violet-400" />
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-white/50 mt-0.5">Manage your account</p>
      </div>

      {/* Profile avatar row */}
      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 sm:h-16 sm:w-16 shrink-0">
              <AvatarImage src={session?.user?.image || ""} />
              <AvatarFallback className="text-xl">
                {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white truncate">{session?.user?.name}</p>
              <p className="text-xs sm:text-sm text-white/50 truncate">{session?.user?.email}</p>
              <Badge variant={session?.user?.role === "FREE" ? "secondary" : "pro"} className="mt-1 text-xs">
                {session?.user?.role} Plan
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile form */}
      <Card>
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2">
            <User className="h-4 w-4 text-violet-400" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="h-11 text-base"
              autoComplete="name"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              value={session?.user?.email || ""}
              disabled
              className="h-11 text-base opacity-50"
            />
            <p className="text-xs text-white/30">Email cannot be changed</p>
          </div>
          <Button
            onClick={handleUpdateProfile}
            disabled={saving}
            className="w-full sm:w-auto h-11"
          >
            {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : "Save Profile"}
          </Button>
        </CardContent>
      </Card>

      {/* Password form */}
      <Card>
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-violet-400" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="h-11 text-base"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              placeholder="Minimum 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-11 text-base"
            />
          </div>
          <Button
            onClick={handleChangePassword}
            disabled={changingPassword}
            variant="outline"
            className="w-full sm:w-auto h-11"
          >
            {changingPassword ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Changing...</> : "Change Password"}
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-500/20">
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="text-sm sm:text-base text-red-400">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-white">Delete Account</p>
              <p className="text-xs text-white/50 mt-0.5">Permanently delete your account and all data</p>
            </div>
            <Button variant="destructive" size="sm" className="w-full sm:w-auto h-10" disabled>
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
