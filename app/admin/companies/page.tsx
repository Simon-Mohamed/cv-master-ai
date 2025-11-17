"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { authService } from "@/lib/authService";

export default function CompaniesPage() {
  const { toast } = useToast();
   const router = useRouter();
  const [companies, setCompanies] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<"add" | "edit">("add");
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    website: "",
    logo: "",
  });

  // Fetch companies
  const fetchCompanies = async () => {
    try {
      const res = await authService.getAllCompanies();
      setCompanies(res.data);
    } catch {
      toast({ title: "Error", description: "Failed to load companies", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // open form
  const openForm = (type: "add" | "edit", company?: any) => {
    setFormType(type);
    setShowForm(true);

    if (type === "edit" && company) {
      setSelectedCompany(company);
      setFormData({
        name: company.name || "",
        location: company.location || "",
        description: company.description || "",
        website: company.website || "",
        logo: "",
      });
    } else {
      setSelectedCompany(null);
      setFormData({ name: "", location: "", description: "", website: "", logo: "" });
    }
  };

  // submit add/edit
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    let payload: Partial<typeof formData> = { ...formData };
    Object.keys(payload).forEach((k) => {
      const key = k as keyof typeof payload;
      if (payload[key] === "") {
        delete payload[key];
      }
    });

    try {
      if (formType === "add") {
        // CREATE
        const res = await authService.createCompany(payload);
        setCompanies([...companies, res.data]);
        toast({ title: "Success", description: "Company added successfully" });
      } else {
        // UPDATE
       const res = await authService.updateCompany(selectedCompany.id, payload);

setCompanies((prev) =>
  prev.map((c) => (c.id === selectedCompany.id ? res.data.company : c))
);

        toast({ title: "Updated", description: "Company updated successfully" });
      }

      setShowForm(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed saving company",
        variant: "destructive",
      });
    }
  };

  // delete
  const deleteCompany = async (id: number) => {
    if (!confirm("Are you sure?")) return;

    try {
      await authService.deleteCompany(id);
      setCompanies((prev) => prev.filter((c) => c.id !== id));
      toast({ title: "Deleted", description: "Company deleted" });
    } catch {
      toast({ title: "Error", description: "Failed deleting company", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10">

      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Companies</h1>
        <Button onClick={() => openForm("add")}>+ Add Company</Button>
      </div>

      {/* GRID 2 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {companies.map((c) => (
          <div key={c.id} className="p-4 border rounded-lg shadow-sm bg-white">
            <h2 className="text-xl font-semibold">{c.name}</h2>
            <p className="text-gray-700">{c.location}</p>
            <p className="text-sm text-blue-500">{c.website}</p>

            <div className="flex gap-3 mt-4">
              <Button size="sm" onClick={() => openForm("edit", c)}>Edit</Button>
              <Button size="sm" variant="destructive" onClick={() => deleteCompany(c.id)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
        {/* BACK BUTTON */}
          <div className="mt-8 pt-8 border-t border-border">
            <Button
              onClick={() => router.push("/dashboard")}
              variant="outline"
              className="w-full"
            >
              Back to Dashboard
            </Button>
          </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">
              {formType === "add" ? "Add Company" : "Edit Company"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                placeholder="Name"
                className="w-full p-2 border rounded"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <input
                placeholder="Location"
                className="w-full p-2 border rounded"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />

              <textarea
                placeholder="Description"
                className="w-full p-2 border rounded"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />

              <input
                placeholder="Website"
                className="w-full p-2 border rounded"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />

              <input
                placeholder="Logo (URL)"
                className="w-full p-2 border rounded"
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
              />

              <div className="flex gap-4 mt-4">
                <Button type="submit">Save</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
         
        </div>
      )}

    </div>
  );
}
