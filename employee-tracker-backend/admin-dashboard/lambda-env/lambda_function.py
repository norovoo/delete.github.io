import json
import boto3
import base64
from datetime import datetime

s3 = boto3.client('s3')
BUCKET_NAME = 'your-bucket-name'  # Replace with your S3 bucket name

def upload_to_s3(file_data, file_name):
    try:
        s3.put_object(
            Bucket=BUCKET_NAME,
            Key=file_name,
            Body=file_data,
            ContentType='application/pdf'
        )
        file_url = f'https://{BUCKET_NAME}.s3.amazonaws.com/{file_name}'
        return file_url
    except Exception as e:
        print(f"Error uploading to S3: {e}")
        raise

def lambda_handler(event, context):
    try:
        if 'file' in event and 'base64' in event['file']:
            file_data = base64.b64decode(event['file']['base64'])
            order_id = event.get('order_id', 'Unknown_Order')
            file_name = f'{order_id}_warranty_{datetime.now().strftime("%Y%m%d%H%M%S")}.pdf'
            file_url = upload_to_s3(file_data, file_name)

            return {
                'statusCode': 200,
                'body': json.dumps({'message': 'PDF uploaded successfully', 'fileUrl': file_url}),
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'OPTIONS,POST',
                    'Access-Control-Allow-Headers': 'Content-Type'
                }
            }

        else:
            raise ValueError("No base64 file data found in the event")

    except Exception as e:
        print(f"Error: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)}),
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        }
