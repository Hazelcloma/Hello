from flask import Flask, request, jsonify, send_from_directory
from flask_mail import Mail, Message
from flask_cors import CORS
from dotenv import load_dotenv
import os
import logging
import socket

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Get the directory containing app.py
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__, static_folder=BASE_DIR)
CORS(app)

# Mail configuration
app.config.update(
    MAIL_SERVER=os.getenv('MAIL_SERVER'),
    MAIL_PORT=int(os.getenv('MAIL_PORT')),
    MAIL_USE_TLS=True,
    MAIL_USERNAME=os.getenv('MAIL_USERNAME'),
    MAIL_PASSWORD=os.getenv('MAIL_PASSWORD')
)

mail = Mail(app)

@app.route('/')
def index():
    return send_from_directory(BASE_DIR, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(BASE_DIR, path)

@app.route('/send-email', methods=['POST'])
def send_email():
    try:
        data = request.get_json()
        logger.info(f"Received form data: {data}")
        
        name = data.get('name')
        email = data.get('email')
        message = data.get('message')

        if not all([name, email, message]):
            logger.error("Missing required fields")
            return jsonify({'error': 'Missing required fields'}), 400

        # Log email configuration
        logger.info(f"Mail server: {app.config['MAIL_SERVER']}")
        logger.info(f"Mail port: {app.config['MAIL_PORT']}")
        logger.info(f"Using TLS: {app.config['MAIL_USE_TLS']}")
        logger.info(f"Mail username: {app.config['MAIL_USERNAME']}")

        # Create the email message to yourself
        msg = Message(
            subject=f'New Contact Form Message from {name}',
            sender=app.config['MAIL_USERNAME'],
            recipients=[app.config['MAIL_USERNAME']],
            body=f'''
Name: {name}
Email: {email}

Message:
{message}
            '''
        )

        # Send the email to yourself
        try:
            mail.send(msg)
            logger.info(f"Email sent successfully to admin")
        except Exception as e:
            logger.error(f"Error sending email to admin: {str(e)}")
            raise

        # Send an auto-reply to the sender
        auto_reply = Message(
            subject='Thank you for your message',
            sender=app.config['MAIL_USERNAME'],
            recipients=[email],
            body=f'''
Dear {name},

Thank you for contacting me. I have received your message and will get back to you as soon as possible.

Best regards,
Hazel
            '''
        )

        try:
            mail.send(auto_reply)
            logger.info(f"Auto-reply sent successfully to {email}")
        except Exception as e:
            logger.error(f"Error sending auto-reply: {str(e)}")
            # Don't raise here, as we already sent the main email

        return jsonify({'message': 'Email sent successfully'}), 200

    except Exception as e:
        logger.error(f"Error in send_email: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Verify email configuration on startup
    logger.info("Starting Flask application...")
    logger.info(f"Mail server: {os.getenv('MAIL_SERVER')}")
    logger.info(f"Mail port: {os.getenv('MAIL_PORT')}")
    logger.info(f"Mail username: {os.getenv('MAIL_USERNAME')}")
    
    # Get local IP address
    hostname = socket.gethostname()
    local_ip = socket.gethostbyname(hostname)
    logger.info(f"Server running at: http://{local_ip}:5000")
    
    app.run(host='0.0.0.0', port=5000, debug=True) 