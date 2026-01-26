import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Search } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: {
    id: string;
    full_name: string;
    avatar_url?: string | null;
    bio?: string | null;
    college_id?: string | null;
  } | null;
  userRole: string;
  onProfileUpdate: () => void;
}

export function ProfileSheet({ open, onOpenChange, profile, userRole, onProfileUpdate }: ProfileSheetProps) {
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [collegeId, setCollegeId] = useState<string | null>(null);
  const [colleges, setColleges] = useState<Array<{ id: string; name: string; location: string; state: string }>>([]);
  const [collegeOpen, setCollegeOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setBio(profile.bio || "");
      setCollegeId(profile.college_id || null);
    }
  }, [profile]);

  useEffect(() => {
    const fetchColleges = async () => {
      const { data } = await supabase
        .from("colleges")
        .select("id, name, location, state")
        .order("name");
      if (data) setColleges(data);
    };
    fetchColleges();
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          bio: bio,
          college_id: collegeId,
        })
        .eq("id", profile.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });
      
      onProfileUpdate();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const selectedCollege = colleges.find((c) => c.id === collegeId);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>My Profile</SheetTitle>
          <SheetDescription>
            View and update your profile information
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                {fullName ? getInitials(fullName) : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="font-medium text-lg">{fullName || "User"}</p>
              <p className="text-sm text-muted-foreground capitalize">{userRole}</p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label>College</Label>
              <Popover open={collegeOpen} onOpenChange={setCollegeOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={collegeOpen}
                    className="w-full justify-between text-left font-normal"
                  >
                    <span className="truncate">
                      {selectedCollege?.name || "Select your college..."}
                    </span>
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[350px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search colleges..." />
                    <CommandList>
                      <CommandEmpty>No college found.</CommandEmpty>
                      <CommandGroup>
                        {colleges.map((college) => (
                          <CommandItem
                            key={college.id}
                            value={`${college.name} ${college.location} ${college.state}`}
                            onSelect={() => {
                              setCollegeId(college.id);
                              setCollegeOpen(false);
                            }}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">{college.name}</span>
                              <span className="text-sm text-muted-foreground">
                                {college.location}, {college.state}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {!collegeId && (
                <p className="text-sm text-destructive">
                  Please select a college to create subjects
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
              />
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
