"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api-client";
import PersonIcon from "@mui/icons-material/Person";
import EmergencyShareIcon from "@mui/icons-material/EmergencyShare";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import EditIcon from "@mui/icons-material/Edit";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";

interface PatientProfile {
  id: string;
  phone_number: string;
  email?: string;
  role: string;
  is_active: boolean;
  created_at: string;
  full_name: string;
  gender?: string;
  dob?: string;
  emergency_contact_name?: string;
  emergency_contact_relation?: string;
  emergency_contact_phone?: string;
}

interface EditFormData {
  full_name: string;
  email: string;
  gender: string;
  dob: string;
  emergency_contact_name: string;
  emergency_contact_relation: string;
  emergency_contact_phone: string;
}

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<EditFormData>({
    full_name: "",
    email: "",
    gender: "",
    dob: "",
    emergency_contact_name: "",
    emergency_contact_relation: "",
    emergency_contact_phone: "",
  });

  useEffect(() => {
    if (!authLoading && user) {
      fetchProfile();
    }
  }, [authLoading, user]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get("/patients/profile");
      setProfile(response.data);
      // Initialize form data
      setFormData({
        full_name: response.data.full_name || "",
        email: response.data.email || "",
        gender: response.data.gender || "",
        dob: response.data.dob ? response.data.dob.split('T')[0] : "",
        emergency_contact_name: response.data.emergency_contact_name || "",
        emergency_contact_relation: response.data.emergency_contact_relation || "",
        emergency_contact_phone: response.data.emergency_contact_phone || "",
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    // Reset form to current profile data
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        email: profile.email || "",
        gender: profile.gender || "",
        dob: profile.dob ? profile.dob.split('T')[0] : "",
        emergency_contact_name: profile.emergency_contact_name || "",
        emergency_contact_relation: profile.emergency_contact_relation || "",
        emergency_contact_phone: profile.emergency_contact_phone || "",
      });
    }
    setIsEditMode(false);
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      setError("");
      
      const updateData: any = {};
      if (formData.full_name) updateData.full_name = formData.full_name;
      if (formData.email) updateData.email = formData.email;
      if (formData.gender) updateData.gender = formData.gender;
      if (formData.dob) updateData.dob = formData.dob;
      if (formData.emergency_contact_name) updateData.emergency_contact_name = formData.emergency_contact_name;
      if (formData.emergency_contact_relation) updateData.emergency_contact_relation = formData.emergency_contact_relation;
      if (formData.emergency_contact_phone) updateData.emergency_contact_phone = formData.emergency_contact_phone;

      const response = await apiClient.put("/patients/profile", updateData);
      setProfile(response.data);
      setIsEditMode(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof EditFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not specified";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getMemberSinceDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error || "Failed to load profile"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
      <div className="w-full max-w-[900px] mx-auto px-6 py-10">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 pb-8 border-b border-slate-200/60 dark:border-slate-700/60">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-28 h-28 rounded-3xl bg-slate-100 dark:bg-slate-700 border-4 border-white dark:border-slate-800 shadow-soft overflow-hidden">
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                  <span className="text-5xl font-bold">
                    {profile.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <button className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-700 p-2 rounded-full shadow-md border border-slate-100 dark:border-slate-600 hover:text-primary transition-colors">
                <CameraAltIcon className="text-[18px]" />
              </button>
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                {profile.full_name}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Patient Account</p>
            </div>
          </div>
          {isEditMode ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancelEdit}
                className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-6 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95"
              >
                <CloseIcon className="text-[18px]" />
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-green-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SaveIcon className="text-[18px]" />
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          ) : (
            <button
              onClick={handleEditClick}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-green-600/20 transition-all active:scale-95"
            >
              <EditIcon className="text-[18px]" />
              Edit Profile
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Profile Sections */}
        <div className="grid grid-cols-1 gap-8">
          {/* Personal Information */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-soft overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-50 dark:border-slate-700/50 flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                <PersonIcon className="text-[20px]" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                Personal Information
              </h3>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Full Name
                  </p>
                  {isEditMode ? (
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange("full_name", e.target.value)}
                      className="w-full text-base font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2"
                      placeholder="Enter full name"
                    />
                  ) : (
                    <p className="text-base font-semibold text-slate-900 dark:text-white">
                      {profile.full_name}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Gender
                  </p>
                  {isEditMode ? (
                    <select
                      value={formData.gender}
                      onChange={(e) => handleInputChange("gender", e.target.value)}
                      className="w-full text-base font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2"
                    >
                      <option value="">Select gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  ) : (
                    <p className="text-base font-semibold text-slate-900 dark:text-white">
                      {profile.gender || "Not specified"}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Date of Birth
                  </p>
                  {isEditMode ? (
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={(e) => handleInputChange("dob", e.target.value)}
                      className="w-full text-base font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2"
                    />
                  ) : (
                    <p className="text-base font-semibold text-slate-900 dark:text-white">
                      {formatDate(profile.dob)}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Mobile Number
                  </p>
                  <p className="text-base font-semibold text-slate-900 dark:text-white">
                    {profile.phone_number}
                  </p>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Email Address
                  </p>
                  {isEditMode ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="w-full text-base font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2"
                      placeholder="Enter email address"
                    />
                  ) : (
                    <p className="text-base font-semibold text-slate-900 dark:text-white">
                      {profile.email || "Not specified"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-soft overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-50 dark:border-slate-700/50 flex items-center gap-3">
              <div className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                <EmergencyShareIcon className="text-[20px]" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                Emergency Contact
              </h3>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Guardian Name
                  </p>
                  {isEditMode ? (
                    <input
                      type="text"
                      value={formData.emergency_contact_name}
                      onChange={(e) => handleInputChange("emergency_contact_name", e.target.value)}
                      className="w-full text-base font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2"
                      placeholder="Enter guardian name"
                    />
                  ) : (
                    <p className="text-base font-semibold text-slate-900 dark:text-white">
                      {profile.emergency_contact_name || "Not specified"}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Relation
                  </p>
                  {isEditMode ? (
                    <input
                      type="text"
                      value={formData.emergency_contact_relation}
                      onChange={(e) => handleInputChange("emergency_contact_relation", e.target.value)}
                      className="w-full text-base font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2"
                      placeholder="e.g., Spouse, Parent"
                    />
                  ) : (
                    <p className="text-base font-semibold text-slate-900 dark:text-white">
                      {profile.emergency_contact_relation || "Not specified"}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Contact Number
                  </p>
                  {isEditMode ? (
                    <input
                      type="tel"
                      value={formData.emergency_contact_phone}
                      onChange={(e) => handleInputChange("emergency_contact_phone", e.target.value)}
                      className="w-full text-base font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2"
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <p className="text-base font-semibold text-slate-900 dark:text-white">
                      {profile.emergency_contact_phone || "Not specified"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-soft overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-50 dark:border-slate-700/50 flex items-center gap-3">
              <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg">
                <VerifiedUserIcon className="text-[20px]" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                Account Status
              </h3>
            </div>
            <div className="p-8">
              <div className="flex items-center gap-4">
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Member Since
                  </p>
                  <p className="text-base font-semibold text-slate-900 dark:text-white">
                    {getMemberSinceDate(profile.created_at)}
                  </p>
                </div>
                <div className="w-px h-8 bg-slate-100 dark:bg-slate-700 mx-4"></div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Verification
                  </p>
                  <p className="flex items-center gap-1.5 text-base font-semibold text-green-600 dark:text-green-400">
                    <CheckCircleIcon className="text-[18px]" />
                    {profile.is_active ? "Identity Verified" : "Pending Verification"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center">
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Manage your health data securely.
          </p>
        </div>
      </div>
    </div>
  );
}
