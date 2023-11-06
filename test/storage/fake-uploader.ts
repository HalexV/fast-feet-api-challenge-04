import {
  UploadParams,
  Uploader,
} from '@/domain/fast-feet/application/storage/uploader'

export interface Uploads {
  filename: string
  url: string
}

export class FakeUploader implements Uploader {
  public uploads: Uploads[] = []

  async upload({ filename }: UploadParams): Promise<{ url: string }> {
    const uploadId = 'randomId'
    const uniqueFileName = `${uploadId}-${filename}`

    this.uploads.push({
      filename,
      url: uniqueFileName,
    })

    return { url: uniqueFileName }
  }
}
