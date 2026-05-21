import { uploadStorageFile } from './fileUploads'
import { getPublicAssetUrl } from './mediaAssets'
import { updateMentorCourse } from './mentor'

/** Upload a cover image and save public URL on the course. */
export async function uploadMentorCourseThumbnail(courseId, file) {
  if (!courseId) throw new Error('Missing courseId')
  if (!file) throw new Error('File is required')

  const upload = await uploadStorageFile({
    file,
    bucket: 'public',
    folder: `course-thumbnails/${courseId}`,
    uploadRole: 'mentor',
  })
  const thumbnail_url = getPublicAssetUrl({ bucket: upload.bucket, path: upload.path })
  return updateMentorCourse(courseId, { thumbnail_url })
}
