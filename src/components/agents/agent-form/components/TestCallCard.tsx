import { Dispatch, SetStateAction } from "react";
import { Phone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PhoneInput } from "@/components/ui/phone-input";
import { Button } from "@/components/ui/button";

interface TestCallCardProps {
  testFirstName: string;
  setTestFirstName: Dispatch<SetStateAction<string>>;
  testLastName: string;
  setTestLastName: Dispatch<SetStateAction<string>>;
  testGender: string;
  setTestGender: Dispatch<SetStateAction<string>>;
  testPhone: string;
  setTestPhone: Dispatch<SetStateAction<string>>;
  calling: boolean;
  onTestCall: () => void | Promise<void>;
}

export function TestCallCard({
  testFirstName,
  setTestFirstName,
  testLastName,
  setTestLastName,
  testGender,
  setTestGender,
  testPhone,
  setTestPhone,
  calling,
  onTestCall,
}: TestCallCardProps) {
  return (
    <div className="lg:col-span-1">
      <div className="lg:sticky lg:top-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Test Call
            </CardTitle>
            <CardDescription>
              Make a test call to preview your agent. Each test call will
              deduct credits from your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="test-first-name">First Name</Label>
                  <Input
                    id="test-first-name"
                    placeholder="John"
                    value={testFirstName}
                    onChange={(e) => setTestFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="test-last-name">Last Name</Label>
                  <Input
                    id="test-last-name"
                    placeholder="Doe"
                    value={testLastName}
                    onChange={(e) => setTestLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={testGender} onValueChange={setTestGender}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="test-phone">
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <PhoneInput
                  defaultCountry="EG"
                  value={testPhone}
                  onChange={(value) => setTestPhone(value)}
                  placeholder="Enter phone number"
                />
              </div>

              <Button className="w-full" onClick={onTestCall} disabled={calling}>
                <Phone className="mr-2 h-4 w-4" />
                {calling ? "Calling..." : "Start Test Call"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

