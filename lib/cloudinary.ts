const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

export async function uploadImage(file: File): Promise<CloudinaryUploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET as string);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!response.ok) {
    throw new Error("Falha ao enviar imagem para o Cloudinary");
  }

  const data = await response.json();
  return { url: data.secure_url, publicId: data.public_id };
}

/**
 * Pede ao Cloudinary uma cópia menor (WebP/AVIF automático) em vez do original, que chega a vários MB.
 * O original e a URL gravada no banco não mudam. URL que não for do Cloudinary passa direto.
 * `largura` em px físicos (≈ 2× o tamanho na tela).
 */
export function otimizar(url: string | undefined | null, largura = 400) {
  if (!url) return url ?? undefined;
  return url.replace(
    /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(?=v\d+\/)/,
    `$1w_${largura},c_limit,f_auto,q_auto/`
  );
}
