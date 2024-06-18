import cloud from "cloudinary";

const cloudinary = cloud.v2;

const cloudinaryUploadImage = async (
  img: string,
  id?: string
): Promise<cloud.UploadApiResponse | null> => {
  // Configuration
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
  });

  try {
    const res = await cloudinary.uploader.upload(img, {
      folder: "budgetease",
      public_id: id,
      width: 1000,
      crop: "scale",
      quality: "auto",
      fetch_format: "auto",
    });

    return res;
  } catch (err) {
    console.log(err);
    return null;
  }
};

const cloudinaryDeleteImage = async (id: string) => {
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
  });

  try {
    const res = await cloudinary.uploader.destroy(id);

    return res;
  } catch (err) {
    console.log(err);
  }
};

export { cloudinaryUploadImage, cloudinaryDeleteImage };
