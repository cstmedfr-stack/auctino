import { supabase } from "@/lib/supabase";
import { ProductImage } from "@/types/productImage";

const MAX_PRODUCT_IMAGES = 8;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function validateImageFile(file: File) {
  if (!ALLOWED_IMAGE_TYPES[file.type]) {
    throw new Error(
      `product_image_invalid_type|${file.name}`
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `product_image_oversized|${file.name}`
    );
  }
}

async function verifyImageManagementAccess(
  productId: string
) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(
      "product_image_auth_required"
    );
  }

  const { data: canManage, error } =
    await supabase.rpc(
      "can_manage_own_product_images",
      {
        p_product_id_text: productId,
      }
    );

  if (error) {
    throw error;
  }

  if (!canManage) {
    throw new Error(
      "product_image_cannot_modify"
    );
  }

  return user;
}

export async function getProductImages(
  productId: string
) {
  return await supabase
    .from("product_images")
    .select(
      "id, product_id, image_url, storage_path, display_order, created_at"
    )
    .eq("product_id", productId)
    .order("display_order", {
      ascending: true,
    });
}

export async function uploadProductImages(
  productId: string,
  userId: string,
  files: File[]
): Promise<ProductImage[]> {
  if (files.length === 0) {
    return [];
  }

  const user =
    await verifyImageManagementAccess(
      productId
    );

  if (user.id !== userId) {
    throw new Error(
      "product_image_not_owner"
    );
  }

  for (const file of files) {
    validateImageFile(file);
  }

  const {
    data: existingImages,
    error: imagesError,
  } = await getProductImages(productId);

  if (imagesError) {
    throw imagesError;
  }

  const existingCount =
    existingImages?.length ?? 0;

  if (
    existingCount + files.length >
    MAX_PRODUCT_IMAGES
  ) {
    const availableSlots =
      MAX_PRODUCT_IMAGES - existingCount;

    throw new Error(
      availableSlots > 0
        ? `product_image_remaining_slots|${availableSlots}`
        : "product_image_max_reached"
    );
  }

  const createdImages: ProductImage[] = [];

  try {
    for (
      let index = 0;
      index < files.length;
      index += 1
    ) {
      const file = files[index];
      const extension =
        ALLOWED_IMAGE_TYPES[file.type];

      const fileName =
        `${crypto.randomUUID()}.${extension}`;

      const storagePath =
        `${user.id}/${productId}/${fileName}`;

      const { error: uploadError } =
        await supabase.storage
          .from("product-images")
          .upload(storagePath, file, {
            cacheControl: "3600",
            contentType: file.type,
            upsert: false,
          });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } =
        supabase.storage
          .from("product-images")
          .getPublicUrl(storagePath);

      const imageUrl =
        publicUrlData.publicUrl;

      const {
        data: imageId,
        error: registerError,
      } = await supabase.rpc(
        "register_own_product_image",
        {
          p_product_id: productId,
          p_storage_path: storagePath,
          p_image_url: imageUrl,
        }
      );

      if (registerError || !imageId) {
        await supabase.storage
          .from("product-images")
          .remove([storagePath]);

        throw (
          registerError ??
          new Error(
            "product_image_register_failed"
          )
        );
      }

      createdImages.push({
        id: imageId as string,
        product_id: productId,
        image_url: imageUrl,
        storage_path: storagePath,
        display_order:
          existingCount + index,
        created_at:
          new Date().toISOString(),
      });
    }

    return createdImages;
  } catch (error) {
    for (
      const createdImage of [
        ...createdImages,
      ].reverse()
    ) {
      try {
        await deleteProductImage(
          createdImage.id
        );
      } catch (rollbackError) {
        console.error(
          "Partial product image upload rollback failed:",
          rollbackError
        );
      }
    }

    throw error;
  }
}

export async function deleteProductImage(
  imageId: string
) {
  const { data: storagePath, error } =
    await supabase.rpc(
      "delete_own_product_image_secure",
      {
        p_image_id: imageId,
      }
    );

  if (error) {
    throw error;
  }

  if (storagePath) {
    const { error: storageError } =
      await supabase.storage
        .from("product-images")
        .remove([storagePath as string]);

    if (storageError) {
      console.warn(
        "Product image record deleted but storage file removal failed:",
        storageError.message
      );
    }
  }

  return {
    data: true,
    error: null,
  };
}

export async function updateMainProductImage(
  productId: string
) {
  return await supabase.rpc(
    "refresh_own_product_main_image_secure",
    {
      p_product_id: productId,
    }
  );
}