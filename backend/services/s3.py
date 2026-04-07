import boto3, uuid
from io import BytesIO
from starlette.datastructures import UploadFile
from config import settings

s3_client = boto3.client(
    "s3",
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_REGION
)

async def upload_to_s3(file: UploadFile):
    contents = await file.read()
    file_obj = BytesIO(contents)

    filename = f"{uuid.uuid4()}_{file.filename}"

    s3_client.upload_fileobj(
        file_obj,
        settings.AWS_BUCKET_NAME,
        filename,
        ExtraArgs={"ContentType": file.content_type}
    )

    return f"https://{settings.AWS_BUCKET_NAME}.s3.amazonaws.com/{filename}"