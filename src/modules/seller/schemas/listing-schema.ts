import { z } from "zod";

export const listingSchema = z.object({
  title: z.string().min(5, "Tieu de toi thieu 5 ky tu").max(200, "Tieu de toi da 200 ky tu"),
  description: z.string().min(20, "Mo ta toi thieu 20 ky tu"),
  serialNumber: z.string().min(3, "So khung bat buoc"),
  category: z.string().min(1, "Vui long chon loai xe"),
  brand: z.string().min(1, "Vui long chon thuong hieu"),
  frameSize: z.string().min(1, "Vui long chon size khung"),
  weight: z.coerce.number({ invalid_type_error: "Can nhap trong luong" }),
  frameMaterial: z.string().optional(),
  condition: z.string().min(1, "Vui long chon tinh trang"),
  paint: z.string().optional(),
  groupset: z.string().min(1, "Thong tin groupset bat buoc"),
  operating: z.string().optional(),
  tireRim: z.string().min(1, "Vui long chon co banh"),
  brakeType: z.string().optional(),
  overall: z.string().optional(),
  price: z.coerce.number().positive("Gia phai lon hon 0"),
  city: z.enum(["hanoi", "hcm", "danang"], {
    errorMap: () => ({ message: "Chi ho tro Ha Noi, TP.HCM va Da Nang" }),
  }),
  medias: z
    .array(
      z.object({
        image: z.string().url("Anh khong hop le"),
        videoUrl: z.string().url("Video khong hop le").optional(),
        type: z.union([z.literal(0), z.literal(1)]),
      }),
    )
    .min(1, "Can it nhat 1 media, bao gom anh groupset"),
});

export type ListingFormValues = z.infer<typeof listingSchema>;
