import salonWomen from "@/assets/cat-salon-women.jpg";
import salonMen from "@/assets/cat-salon-men.jpg";
import ac from "@/assets/cat-ac.jpg";
import cleaning from "@/assets/cat-cleaning.jpg";
import electrician from "@/assets/cat-electrician.jpg";
import plumber from "@/assets/cat-plumber.jpg";
import painting from "@/assets/cat-painting.jpg";
import pest from "@/assets/cat-pest.jpg";
import massage from "@/assets/cat-massage.jpg";

const map: Record<string, string> = {
  "salon-women": salonWomen,
  "salon-men": salonMen,
  "ac-repair": ac,
  cleaning,
  electrician,
  plumber,
  painting,
  "pest-control": pest,
  massage,
};

export function categoryImage(slug: string, fallback?: string | null) {
  return map[slug] ?? fallback ?? cleaning;
}
