"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  frameCracks: z.enum(["ok", "minor", "major"]),
  brakePads: z.enum(["ok", "replace_soon", "replace_now"]),
  chainWearPct: z.number().min(0).max(1),
  shifting: z.enum(["ok", "needs_adjustment", "problematic"]),
  reportUrl: z.string().url(),
  notes: z.string().min(10),
});

type FormValues = z.infer<typeof schema>;

export function InspectionChecklistForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      frameCracks: "ok",
      brakePads: "ok",
      chainWearPct: 0.2,
      shifting: "ok",
      reportUrl: "https://files.placeholders.dev/?id=inspection-report.pdf",
      notes: "",
    },
  });

  return (
    <Form {...form}>
      <form
        className="grid gap-4 md:grid-cols-2"
        onSubmit={form.handleSubmit(() => toast.success("Mock inspection report submitted."))}
      >
        <FormField
          control={form.control}
          name="frameCracks"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Frame cracks</FormLabel>
              <Select defaultValue={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ok">ok</SelectItem>
                  <SelectItem value="minor">minor</SelectItem>
                  <SelectItem value="major">major</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="brakePads"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brake pads</FormLabel>
              <Select defaultValue={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ok">ok</SelectItem>
                  <SelectItem value="replace_soon">replace_soon</SelectItem>
                  <SelectItem value="replace_now">replace_now</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="chainWearPct"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chain wear (0-1)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="shifting"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shifting</FormLabel>
              <Select defaultValue={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ok">ok</SelectItem>
                  <SelectItem value="needs_adjustment">needs_adjustment</SelectItem>
                  <SelectItem value="problematic">problematic</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="reportUrl"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Report URL (PDF)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea rows={5} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="md:col-span-2">
          <Button type="submit">Submit checklist</Button>
        </div>
      </form>
    </Form>
  );
}

