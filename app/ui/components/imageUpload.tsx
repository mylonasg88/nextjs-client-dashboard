'use client';

import Image from 'next/image';
import { ChangeEvent, useState } from 'react';

export default function ImageUpload({ url, alt }: { url: string, alt: string }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  return (
    <>
      <Image
        src={
          selectedImage
            ? selectedImage
            : url.length > 0
              ? url
              : '/customers/default/profile.png'
        }
        width={48}
        height={48}
        alt={alt}
        className="rounded-full"
      />

      <label
        htmlFor="profileImage"
        className="hover:bg-gray-100 cursor-pointer px-2 py-1 text-sm font-semibold text-gray-900 bg-white inline-block rounded-md ring-gray-300 ring-1 p-28"
      >
        {url.length > 0 ? 'Change' : 'Upload image'}
      </label>

      <input type="file" id="profileImage" name="profileImage" className="sr-only" onChange={handleImageChange} />
    </>
  );
}
