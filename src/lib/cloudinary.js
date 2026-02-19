export async function uploadImages(files, setProgress) {
  let completed = 0;

  const uploads = files.map((file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "order-images");

    return fetch("https://api.cloudinary.com/v1_1/dkhq6jzxr/image/upload", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        completed++;

        if (setProgress) {
          const percent = Math.round((completed / files.length) * 100);
          setProgress(percent);
        }

        return data;
      });
  });

  const results = await Promise.all(uploads);

  return results.map((r) => r.secure_url);
}
