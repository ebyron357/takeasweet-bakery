import { useState } from "react";
import { Link } from "wouter";
import { Loader2, Lock, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { CATEGORY_LABELS, formatPrice } from "@shared/bakery";

type ProductFormState = {
  id?: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  category: "limber" | "treat-cups" | "cookies" | "cheesecake" | "seasonal";
  imageUrl: string;
  inStock: boolean;
  isSeasonalActive: boolean;
  featured: boolean;
};

const EMPTY_FORM: ProductFormState = {
  name: "",
  slug: "",
  description: "",
  price: "",
  category: "cookies",
  imageUrl: "",
  inStock: true,
  isSeasonalActive: true,
  featured: false,
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function ProductsTab() {
  const utils = trpc.useUtils();
  const { data: products, isLoading } = trpc.admin.listProducts.useQuery();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);

  const invalidate = () => {
    utils.admin.listProducts.invalidate();
    utils.products.invalidate();
  };

  const createProduct = trpc.admin.createProduct.useMutation({
    onSuccess: () => {
      toast.success("Product added!");
      setDialogOpen(false);
      invalidate();
    },
    onError: err => toast.error(err.message),
  });
  const updateProduct = trpc.admin.updateProduct.useMutation({
    onSuccess: () => {
      toast.success("Product updated!");
      setDialogOpen(false);
      invalidate();
    },
    onError: err => toast.error(err.message),
  });
  const deleteProduct = trpc.admin.deleteProduct.useMutation({
    onSuccess: () => {
      toast.success("Product deleted");
      invalidate();
    },
    onError: err => toast.error(err.message),
  });

  const openNew = () => {
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (p: NonNullable<typeof products>[number]) => {
    setForm({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description ?? "",
      price: (p.priceCents / 100).toFixed(2),
      category: p.category,
      imageUrl: p.imageUrl ?? "",
      inStock: p.inStock,
      isSeasonalActive: p.isSeasonalActive,
      featured: p.featured,
    });
    setDialogOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const priceCents = Math.round(parseFloat(form.price) * 100);
    if (!priceCents || priceCents < 50) {
      toast.error("Price must be at least $0.50");
      return;
    }
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || slugify(form.name),
      description: form.description.trim() || undefined,
      priceCents,
      category: form.category,
      imageUrl: form.imageUrl.trim() || undefined,
      inStock: form.inStock,
      isSeasonalActive: form.isSeasonalActive,
      featured: form.featured,
    };
    if (form.id) {
      updateProduct.mutate({ id: form.id, ...payload });
    } else {
      createProduct.mutate(payload);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Product Catalog</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="rounded-full font-bold">
              <Plus className="size-4" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{form.id ? "Edit Product" : "Add Product"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="p-name">Name *</Label>
                <Input
                  id="p-name"
                  required
                  value={form.name}
                  onChange={e =>
                    setForm(f => ({
                      ...f,
                      name: e.target.value,
                      slug: f.id ? f.slug : slugify(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="p-price">Price (USD) *</Label>
                  <Input
                    id="p-price"
                    type="number"
                    step="0.01"
                    min="0.50"
                    required
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Category *</Label>
                  <Select
                    value={form.category}
                    onValueChange={v =>
                      setForm(f => ({ ...f, category: v as ProductFormState["category"] }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="limber">Limber</SelectItem>
                      <SelectItem value="treat-cups">Treat Cups</SelectItem>
                      <SelectItem value="cookies">Cookies</SelectItem>
                      <SelectItem value="cheesecake">Cheesecake</SelectItem>
                      <SelectItem value="seasonal">Seasonal Treats</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-desc">Description</Label>
                <Textarea
                  id="p-desc"
                  rows={3}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-img">Image URL</Label>
                <Input
                  id="p-img"
                  value={form.imageUrl}
                  onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                  placeholder="/manus-storage/…"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <label className="bg-muted flex items-center justify-between gap-2 rounded-xl p-3 text-sm font-semibold">
                  In stock
                  <Switch
                    checked={form.inStock}
                    onCheckedChange={v => setForm(f => ({ ...f, inStock: v }))}
                  />
                </label>
                <label className="bg-muted flex items-center justify-between gap-2 rounded-xl p-3 text-sm font-semibold">
                  Active
                  <Switch
                    checked={form.isSeasonalActive}
                    onCheckedChange={v => setForm(f => ({ ...f, isSeasonalActive: v }))}
                  />
                </label>
                <label className="bg-muted flex items-center justify-between gap-2 rounded-xl p-3 text-sm font-semibold">
                  Featured
                  <Switch
                    checked={form.featured}
                    onCheckedChange={v => setForm(f => ({ ...f, featured: v }))}
                  />
                </label>
              </div>
              <Button
                type="submit"
                className="w-full rounded-full font-bold"
                disabled={createProduct.isPending || updateProduct.isPending}
              >
                {createProduct.isPending || updateProduct.isPending ? "Saving…" : "Save Product"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <Loader2 className="mx-auto my-10 animate-spin" />
      ) : (
        <div className="bg-card overflow-x-auto rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>In Stock</TableHead>
                <TableHead>Seasonal Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(products ?? []).map(p => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {p.imageUrl && (
                        <img src={p.imageUrl} alt="" className="size-9 rounded-lg object-cover" />
                      )}
                      <div>
                        <p className="font-semibold">{p.name}</p>
                        {p.featured && (
                          <Badge variant="secondary" className="rounded-full text-[10px]">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{CATEGORY_LABELS[p.category]}</TableCell>
                  <TableCell className="font-semibold">{formatPrice(p.priceCents)}</TableCell>
                  <TableCell>
                    <Switch
                      checked={p.inStock}
                      onCheckedChange={v => updateProduct.mutate({ id: p.id, inStock: v })}
                      aria-label={`Toggle in-stock for ${p.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={p.isSeasonalActive}
                      onCheckedChange={v =>
                        updateProduct.mutate({ id: p.id, isSeasonalActive: v })
                      }
                      aria-label={`Toggle seasonal availability for ${p.name}`}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => {
                          if (confirm(`Delete "${p.name}"? This cannot be undone.`)) {
                            deleteProduct.mutate({ id: p.id });
                          }
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function OrdersTab() {
  const utils = trpc.useUtils();
  const { data: orders, isLoading } = trpc.admin.listOrders.useQuery();
  const updateStatus = trpc.admin.updateOrderStatus.useMutation({
    onSuccess: () => {
      toast.success("Order updated");
      utils.admin.listOrders.invalidate();
    },
    onError: err => toast.error(err.message),
  });

  if (isLoading) return <Loader2 className="mx-auto my-10 animate-spin" />;

  return (
    <div className="bg-card overflow-x-auto rounded-2xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ref</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(orders ?? []).length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-muted-foreground py-8 text-center">
                No orders yet.
              </TableCell>
            </TableRow>
          )}
          {(orders ?? []).map(o => (
            <TableRow key={o.id}>
              <TableCell className="font-mono text-xs font-semibold">{o.orderRef}</TableCell>
              <TableCell>
                <p className="text-sm font-semibold">{o.customerName ?? "Guest"}</p>
                <p className="text-muted-foreground text-xs">{o.customerEmail ?? "—"}</p>
              </TableCell>
              <TableCell className="font-semibold">{formatPrice(o.totalCents)}</TableCell>
              <TableCell>
                <Select
                  value={o.status}
                  onValueChange={v =>
                    updateStatus.mutate({
                      id: o.id,
                      status: v as "pending" | "paid" | "fulfilled" | "cancelled",
                    })
                  }
                >
                  <SelectTrigger className="h-8 w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="fulfilled">Fulfilled</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="text-muted-foreground text-xs">
                {new Date(o.createdAt).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

const REQUEST_STATUS_LABELS: Record<string, string> = {
  new: "New",
  approved: "Approved",
  deposit_requested: "Deposit Requested",
  confirmed: "Confirmed",
  declined: "Declined",
};

function CustomRequestsTab() {
  const utils = trpc.useUtils();
  const { data: requests, isLoading } = trpc.admin.listCustomRequests.useQuery();
  const updateRequest = trpc.admin.updateCustomRequest.useMutation({
    onSuccess: () => {
      toast.success("Request updated");
      utils.admin.listCustomRequests.invalidate();
    },
    onError: err => toast.error(err.message),
  });

  if (isLoading) return <Loader2 className="mx-auto my-10 animate-spin" />;

  return (
    <div className="space-y-4">
      {(requests ?? []).length === 0 && (
        <p className="text-muted-foreground py-8 text-center">No custom order requests yet.</p>
      )}
      {(requests ?? []).map(r => (
        <div key={r.id} className="bg-card rounded-2xl border p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-bold">
                {r.eventType} · {r.quantity} treats
              </p>
              <p className="text-muted-foreground text-sm">
                {r.name} · {r.email}
                {r.phone ? ` · ${r.phone}` : ""}
              </p>
              <p className="text-muted-foreground text-sm">Event date: {r.eventDate}</p>
              {r.details && <p className="mt-2 text-sm">{r.details}</p>}
            </div>
            <div className="flex flex-col items-end gap-2">
              <Select
                value={r.status}
                onValueChange={v =>
                  updateRequest.mutate({
                    id: r.id,
                    status: v as
                      | "new"
                      | "approved"
                      | "deposit_requested"
                      | "confirmed"
                      | "declined",
                  })
                }
              >
                <SelectTrigger className="h-8 w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(REQUEST_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-xs">
                {new Date(r.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MessagesTab() {
  const { data: messages, isLoading } = trpc.admin.listContactMessages.useQuery();
  if (isLoading) return <Loader2 className="mx-auto my-10 animate-spin" />;
  return (
    <div className="space-y-3">
      {(messages ?? []).length === 0 && (
        <p className="text-muted-foreground py-8 text-center">No messages yet.</p>
      )}
      {(messages ?? []).map(m => (
        <div key={m.id} className="bg-card rounded-2xl border p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="font-bold">{m.name}</p>
            <p className="text-muted-foreground text-xs">
              {new Date(m.createdAt).toLocaleString()}
            </p>
          </div>
          <p className="text-muted-foreground text-sm">{m.email}</p>
          <p className="mt-2 text-sm">{m.message}</p>
        </div>
      ))}
    </div>
  );
}

export default function Admin() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="container py-20 text-center">
        <Loader2 className="mx-auto animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container max-w-md py-20 text-center">
        <Lock className="text-muted-foreground mx-auto size-10" />
        <h1 className="font-display mt-4 text-2xl font-extrabold">Admin sign-in required</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Please sign in with an admin account to manage the bakery.
        </p>
        <Button className="mt-6 rounded-full font-bold" onClick={() => startLogin()}>
          Sign In
        </Button>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="container max-w-md py-20 text-center">
        <Lock className="text-muted-foreground mx-auto size-10" />
        <h1 className="font-display mt-4 text-2xl font-extrabold">Not authorized</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          This area is for the bakery team only.
        </p>
        <Button asChild className="mt-6 rounded-full font-bold">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="font-display mb-6 text-3xl font-extrabold">Bakery Admin</h1>
      <Tabs defaultValue="products">
        <TabsList className="mb-6 flex-wrap rounded-full">
          <TabsTrigger value="products" className="rounded-full">
            Products
          </TabsTrigger>
          <TabsTrigger value="orders" className="rounded-full">
            Orders
          </TabsTrigger>
          <TabsTrigger value="requests" className="rounded-full">
            Custom Requests
          </TabsTrigger>
          <TabsTrigger value="messages" className="rounded-full">
            Messages
          </TabsTrigger>
        </TabsList>
        <TabsContent value="products">
          <ProductsTab />
        </TabsContent>
        <TabsContent value="orders">
          <OrdersTab />
        </TabsContent>
        <TabsContent value="requests">
          <CustomRequestsTab />
        </TabsContent>
        <TabsContent value="messages">
          <MessagesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
