// // ===================== handel companies cruds validation unique name and website ========================
// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { useToast } from "@/components/ui/use-toast";
// import { Button } from "@/components/ui/button";
// import { authService } from "@/lib/authService";

// export default function CompaniesPage() {
//   const { toast } = useToast();
//   const router = useRouter();

//   const [companies, setCompanies] = useState<any[]>([]);
//   const [showForm, setShowForm] = useState(false);
//   const [formType, setFormType] = useState<"add" | "edit">("add");
//   const [selectedCompany, setSelectedCompany] = useState<any>(null);

//   const [formData, setFormData] = useState({
//     name: "",
//     location: "",
//     description: "",
//     website: "",
//     logo: "",
//   });

//   const [errors, setErrors] = useState({
//     name: "",
//     website: "",
//   });

//   // =======================
//   // Fetch companies
//   // =======================
//   const fetchCompanies = async () => {
//     try {
//       const res = await authService.getAllCompanies();
//       const dataArray = Array.isArray(res) ? res : [];
//       setCompanies(dataArray.map((c) => ({ ...c, _key: c.id })));
//     } catch {
//       toast({
//         title: "Error",
//         description: "Failed to load companies",
//         variant: "destructive",
//       });
//     }
//   };

//   useEffect(() => {
//     fetchCompanies();
//   }, []);

//   // =======================
//   // Open form
//   // =======================
//   const openForm = (type: "add" | "edit", company?: any) => {
//     setFormType(type);
//     setShowForm(true);
//     setErrors({ name: "", website: "" });

//     if (type === "edit" && company) {
//       setSelectedCompany(company);
//       setFormData({
//         name: company.name || "",
//         location: company.location || "",
//         description: company.description || "",
//         website: company.website || "",
//         logo: company.logo || "",
//       });
//     } else {
//       setSelectedCompany(null);
//       setFormData({
//         name: "",
//         location: "",
//         description: "",
//         website: "",
//         logo: "",
//       });
//     }
//   };

//   // =======================
//   // Check duplicate
//   // =======================
//   const checkDuplicate = (field: "name" | "website", value: string) => {
//     const exists = companies.some(
//       (c) =>
//         c[field].toLowerCase() === value.toLowerCase() &&
//         (formType === "add" || c.id !== selectedCompany?.id)
//     );
//     setErrors((prev) => ({ ...prev, [field]: exists ? `${field} already exists` : "" }));
//     return exists;
//   };

//   // =======================
//   // Submit add/edit
//   // =======================
//   // const handleSubmit = async (e: any) => {
//   //   e.preventDefault();

//   //   // تحقق من الاسم واللينك قبل الإرسال
//   //   const hasNameError = checkDuplicate("name", formData.name);
//   //   const hasWebsiteError = checkDuplicate("website", formData.website);

//   //   if (hasNameError || hasWebsiteError) return;

//   //   const payload: any = { ...formData };
//   //   Object.keys(payload).forEach((key) => {
//   //     if (payload[key] === "" || payload[key] === null) delete payload[key];
//   //   });

//   //   try {
//   //     if (formType === "add") {
//   //       const res = await authService.createCompany(payload);
//   //       const newCompany = res.company ?? res;
//   //       setCompanies((prev) => [
//   //         ...prev,
//   //         { ...newCompany, _key: newCompany.id },
//   //       ]);
//   //       toast({ title: "Success", description: "Company added successfully" });
//   //     } else if (formType === "edit" && selectedCompany) {
//   //       const res = await authService.updateCompany(selectedCompany.id, payload);
//   //       const updatedCompany = res.company ?? res;
//   //       setCompanies((prev) =>
//   //         prev.map((c) =>
//   //           c.id === selectedCompany.id
//   //             ? { ...updatedCompany, _key: updatedCompany.id }
//   //             : c
//   //         )
//   //       );
//   //       toast({
//   //         title: "Updated",
//   //         description: "Company updated successfully",
//   //       });
//   //     }

//   //     setShowForm(false);
//   //   } catch (error: any) {
//   //     toast({
//   //       title: "Error",
//   //       description: error?.message || "Failed saving company",
//   //       variant: "destructive",
//   //     });
//   //   }
//   // };

//   const handleSubmit = async (e: any) => {
//   e.preventDefault();

//   const hasNameError = checkDuplicate("name", formData.name);
//   const hasWebsiteError = checkDuplicate("website", formData.website);
//   if (hasNameError || hasWebsiteError) return;

//   let payload: any = formData;

//   // لو فيه لوجو → استخدم FormData
//   if (formData.logo instanceof File) {
//     const fd = new FormData();
//     Object.keys(formData).forEach((key) => {
//       if (formData[key]) fd.append(key, formData[key]);
//     });
//     payload = fd;
//   } else {
//     // بدون لوجو → ابعت JSON
//     payload = { ...formData };
//     Object.keys(payload).forEach((key) => {
//       if (!payload[key]) delete payload[key];
//     });
//   }

//   try {
//     if (formType === "add") {
//       const res = await authService.createCompany(payload);
//       const newCompany = res.company ?? res;
//       setCompanies((prev) => [...prev, { ...newCompany, _key: newCompany.id }]);
//       toast({ title: "Success", description: "Company added successfully" });
//     } else {
//       const res = await authService.updateCompany(selectedCompany.id, payload);
//       const updatedCompany = res.company ?? res;
//       setCompanies((prev) =>
//         prev.map((c) => (c.id === selectedCompany.id ? { ...updatedCompany, _key: updatedCompany.id } : c))
//       );
//       toast({ title: "Updated", description: "Company updated successfully" });
//     }

//     setShowForm(false);
//   } catch (error: any) {
//     toast({
//       title: "Error",
//       description: error?.message || "Failed saving company",
//       variant: "destructive",
//     });
//   }
// };

//   // =======================
//   // Delete company
//   // =======================
//   const deleteCompany = async (id: number) => {
//     if (!confirm("Are you sure?")) return;

//     try {
//       await authService.deleteCompany(id);
//       setCompanies((prev) => prev.filter((c) => c.id !== id));
//       toast({ title: "Deleted", description: "Company deleted" });
//     } catch {
//       toast({
//         title: "Error",
//         description: "Failed deleting company",
//         variant: "destructive",
//       });
//     }
//   };

//   return (
//     <div className="max-w-6xl mx-auto py-10">
//       {/* HEADER */}
//       <div className="flex justify-between mb-6">
//         <h1 className="text-3xl font-bold">Companies</h1>
//         <Button onClick={() => openForm("add")}>+ Add Company</Button>
//       </div>

//       {/* GRID 3 columns */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {companies?.map((c) => (
//           <div
//             key={c._key}
//             className="p-4 border rounded-lg shadow-sm bg-white"
//           >
//             <h2 className="text-xl font-semibold">{c.name}</h2>
//             <p className="text-gray-700">{c.location}</p>
//             <p className="text-sm text-blue-500">{c.website}</p>

//             <div className="flex gap-3 mt-4">
//               <Button size="sm" onClick={() => openForm("edit", c)}>
//                 Edit
//               </Button>
//               <Button
//                 size="sm"
//                 variant="destructive"
//                 onClick={() => deleteCompany(c.id)}
//               >
//                 Delete
//               </Button>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* BACK BUTTON */}
//       <div className="mt-8 pt-8 border-t border-border">
//         <Button
//           onClick={() => router.push("/dashboard")}
//           variant="outline"
//           className="w-full"
//         >
//           Back to Dashboard
//         </Button>
//       </div>

//       {/* FORM MODAL */}
//       {showForm && (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-lg">
//             <h2 className="text-2xl font-bold mb-4">
//               {formType === "add" ? "Add Company" : "Edit Company"}
//             </h2>

//             <form onSubmit={handleSubmit} className="space-y-3">
//               <div>
//                 <input
//                   placeholder="Name"
//                   className="w-full p-2 border rounded"
//                   value={formData.name}
//                   onChange={(e) => {
//                     setFormData({ ...formData, name: e.target.value });
//                     checkDuplicate("name", e.target.value);
//                   }}
//                   required
//                 />
//                 {errors.name && (
//                   <p className="text-red-600 text-sm mt-1">{errors.name}</p>
//                 )}
//               </div>

//               <input
//                 placeholder="Location"
//                 className="w-full p-2 border rounded"
//                 value={formData.location}
//                 onChange={(e) =>
//                   setFormData({ ...formData, location: e.target.value })
//                 }
//               />

//               <textarea
//                 placeholder="Description"
//                 className="w-full p-2 border rounded"
//                 value={formData.description}
//                 onChange={(e) =>
//                   setFormData({ ...formData, description: e.target.value })
//                 }
//               />

//               <div>
//                 <input
//                   placeholder="Website"
//                   className="w-full p-2 border rounded"
//                   value={formData.website}
//                   onChange={(e) => {
//                     setFormData({ ...formData, website: e.target.value });
//                     checkDuplicate("website", e.target.value);
//                   }}
//                 />
//                 {errors.website && (
//                   <p className="text-red-600 text-sm mt-1">{errors.website}</p>
//                 )}
//               </div>

//               {/* <input
//                 placeholder="Logo (URL)"
//                 className="w-full p-2 border rounded"
//                 value={formData.logo}
//                 onChange={(e) =>
//                   setFormData({ ...formData, logo: e.target.value })
//                 }
//               /> */}
//               <input
//   type="file"
//   accept="image/*"
//   className="w-full p-2 border rounded"
//   onChange={(e) =>
//     setFormData({ ...formData, logo: e.target.files?.[0] || null })
//   }
// />

//               <div className="flex gap-4 mt-4">
//                 <Button type="submit">Save</Button>
//                 <Button variant="outline" onClick={() => setShowForm(false)}>
//                   Cancel
//                 </Button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// ==========================new code ========================
// ===================== handel companies cruds validation unique name and website ========================
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

  // logo يكون إما: File أو string أو null
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    website: "",
    logo: null as File | string | null,
  });

  const [errors, setErrors] = useState({
    name: "",
    website: "",
  });

  // =======================
  // Fetch companies
  // =======================
  const fetchCompanies = async () => {
    try {
      const res = await authService.getAllCompanies();
      const dataArray = Array.isArray(res) ? res : [];
      setCompanies(dataArray.map((c: any) => ({ ...c, _key: c.id })));
    } catch {
      toast({
        title: "Error",
        description: "Failed to load companies",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // =======================
  // Open form
  // =======================
  const openForm = (type: "add" | "edit", company?: any) => {
    setFormType(type);
    setShowForm(true);
    setErrors({ name: "", website: "" });

    if (type === "edit" && company) {
      setSelectedCompany(company);
      setFormData({
        name: company.name || "",
        location: company.location || "",
        description: company.description || "",
        website: company.website || "",
        logo: company.logo || null, // logo URL not file
      });
    } else {
      setSelectedCompany(null);
      setFormData({
        name: "",
        location: "",
        description: "",
        website: "",
        logo: null,
      });
    }
  };

  // =======================
  // Check duplicate
  // =======================
  const checkDuplicate = (field: "name" | "website", value: string) => {
    const exists = companies.some(
      (c) =>
        c[field].toLowerCase() === value.toLowerCase() &&
        (formType === "add" || c.id !== selectedCompany?.id)
    );
    setErrors((prev) => ({
      ...prev,
      [field]: exists ? `${field} already exists` : "",
    }));
    return exists;
  };

  // =======================
  // Submit add/edit
  // =======================
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const hasNameError = checkDuplicate("name", formData.name);
    const hasWebsiteError = checkDuplicate("website", formData.website);
    if (hasNameError || hasWebsiteError) return;

    let payload: any;

    // لو اللوجو ملف يتم ارسال FormData
    if (formData.logo instanceof File) {
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("location", formData.location);
      fd.append("description", formData.description);
      fd.append("website", formData.website);
      fd.append("logo", formData.logo);
      payload = fd;
    } else {
      // لو اللوجو URL أو null → استخدم JSON
      payload = {
        name: formData.name,
        location: formData.location,
        description: formData.description,
        website: formData.website,
      };
    }

    try {
      if (formType === "add") {
        const res = await authService.createCompany(payload);
        const newCompany = res.company ?? res;
        setCompanies((prev) => [
          ...prev,
          { ...newCompany, _key: newCompany.id },
        ]);
        toast({ title: "Success", description: "Company added successfully" });
      } else {
        const res = await authService.updateCompany(
          selectedCompany.id,
          payload
        );
        const updatedCompany = res.company ?? res;
        setCompanies((prev) =>
          prev.map((c) =>
            c.id === selectedCompany.id
              ? { ...updatedCompany, _key: updatedCompany.id }
              : c
          )
        );
        toast({
          title: "Updated",
          description: "Company updated successfully",
        });
      }

      setShowForm(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed saving company",
        variant: "destructive",
      });
    }
  };

  // =======================
  // Delete company
  // =======================
  const deleteCompany = async (id: number) => {
    if (!confirm("Are you sure?")) return;

    try {
      await authService.deleteCompany(id);
      setCompanies((prev) => prev.filter((c) => c.id !== id));
      toast({ title: "Deleted", description: "Company deleted" });
    } catch {
      toast({
        title: "Error",
        description: "Failed deleting company",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10">
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Companies</h1>
        <Button onClick={() => openForm("add")}>+ Add Company</Button>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {companies?.map((c) => (
          <div
            key={c._key}
            className="p-4 border rounded-lg shadow-sm bg-white"
          >
            <h2 className="text-xl font-semibold">{c.name}</h2>
            <p className="text-gray-700">{c.location}</p>
            <p className="text-sm text-blue-500">{c.website}</p>

            <div className="flex gap-3 mt-4">
              <Button size="sm" onClick={() => openForm("edit", c)}>
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => deleteCompany(c.id)}
              >
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

      {/* FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">
              {formType === "add" ? "Add Company" : "Edit Company"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <input
                  placeholder="Name"
                  className="w-full p-2 border rounded"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    checkDuplicate("name", e.target.value);
                  }}
                  required
                />
                {errors.name && (
                  <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <input
                placeholder="Location"
                className="w-full p-2 border rounded"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />

              <textarea
                placeholder="Description"
                className="w-full p-2 border rounded"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />

              <div>
                <input
                  placeholder="Website"
                  className="w-full p-2 border rounded"
                  value={formData.website}
                  onChange={(e) => {
                    setFormData({ ...formData, website: e.target.value });
                    checkDuplicate("website", e.target.value);
                  }}
                />
                {errors.website && (
                  <p className="text-red-600 text-sm mt-1">{errors.website}</p>
                )}
              </div>

              {/* Logo Upload */}
              <input
                type="file"
                accept="image/*"
                className="w-full p-2 border rounded"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    logo: e.target.files?.[0] || null,
                  })
                }
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
