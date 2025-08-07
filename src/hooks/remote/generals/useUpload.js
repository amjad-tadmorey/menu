import { useState } from 'react'
import { uploadImage } from '../../lib/uploadImage'

export function useUpload(bucket = 'logos') {
    const [uploading, setUploading] = useState(false)
    const [uploadedUrl, setUploadedUrl] = useState(null)
    const [error, setError] = useState(null)

    const upload = async (file) => {
        if (!file) return null

        setUploading(true)
        setError(null)

        const result = await uploadImage(file, bucket)

        if (result.error) {
            setError(result.error.message)
            setUploading(false)
            return null
        }

        setUploadedUrl(result.publicUrl)
        setUploading(false)
        return result.publicUrl
    }

    return {
        uploading,
        uploadedUrl,
        error,
        upload,
    }
}
