from __future__ import absolute_import, print_function

import base64
import docusign_esign as docusign

from docusign_esign import (
    AuthenticationApi,
    EnvelopesApi,
)

from django.conf import settings
from django.urls import reverse

from ..models import CustomerContract


class Esign(object):

    def __init__(self):
        self.client = docusign.ApiClient(settings.DOCUSIGN_BASE_URL)
        self.client.configure_authorization_flow(
            settings.DOCUSIGN_INSTIGATOR_KEY,
            settings.DOCUSIGN_SECRET_KEY,
            settings.DOCUSIGN_REDIRECT_URL,
        )

    def get_login_url(self):
        return self.client.get_authorization_uri()

    def authenticate(self, code):
        self.client.authenticate_with_code(code)
        docusign.configuration.api_client = self.client
        auth = AuthenticationApi()
        login_info = auth.login()
        self.accounts = login_info.login_accounts
        self.account = self.accounts[0]

    def create_document(self):
        contract = CustomerContract.objects.get(is_active=True)
        document_base64 = base64.b64encode(contract.pdf_file.read())
        base64_string = document_base64.decode('utf-8')

        document = docusign.Document()
        document.document_base64 = base64_string
        document.name = contract.filename
        document.file_extension = 'pdf'
        document.document_id = '1'

        return document

    def create_event_notification(self):
        webhook_url = reverse('webhook-docusign')
        url = "{}{}".format(settings.DOCUSIGN_WEBHOOK_BASE_URL, webhook_url)
        events = docusign.EnvelopeEvent(
            envelope_event_status_code='completed',
            include_documents='true',
        )

        notification = docusign.EventNotification(
            url=url,
            include_documents='true',
            envelope_events=[events],
            include_certificate_with_soap='false',
            include_document_fields='true',
            sign_message_with_x509_cert='false',
            include_envelope_void_reason='true',
            include_sender_account_as_custom_field='true',
            include_time_zone='true',
            logging_enabled='true',
        )
        return notification

    def create_envelope(self):
        envelope_definition = self.create_envelope_definition()
        envelopes_api = EnvelopesApi()
        envelope_summary = envelopes_api.create_envelope(
            self.account.account_id,
            envelope_definition=envelope_definition
        )
        return envelope_summary

    def create_envelope_definition(self):
        document = self.create_document()
        recipients = self.create_recipients()
        notification = self.create_event_notification()
        subject = 'APG Labs - Please Sign For Confirmation'
        envelope_definition = docusign.EnvelopeDefinition()
        envelope_definition.email_subject = subject
        envelope_definition.email_blurb = subject
        envelope_definition.documents = [document]
        envelope_definition.recipients = recipients
        envelope_definition.event_notification = notification
        envelope_definition.status = 'sent'
        return envelope_definition

    def create_recipients(self):
        recipients = docusign.Recipients()
        signers = self.create_signers()
        recipients.signers = signers

        return recipients

    def create_signer_object(self, context):
        signer = docusign.Signer()
        for key, value in context.items():
            setattr(signer, key, value)

        return signer

    def create_signers(self):
        client_data = {
            'role_name': 'Client',
            'recipient_id': '1',
            'routing_order': '1',
            'user_id': self.account.user_id,
            'name': self.account.user_name,
            'email': self.account.email
        }
        company_data = {
            'role_name': 'Company',
            'recipient_id': '2',
            'routing_order': '2',
            'user_id': settings.DOCUSIGN_USER_ID,
            'name': settings.DOCUSIGN_COMPANY_NAME,
            'email': settings.DOCUSIGN_USERNAME
        }
        client = self.create_signer_object(client_data)
        company = self.create_signer_object(company_data)
        return [client, company]

    def get_envelope(self, envelope_id):
        api = EnvelopesApi()
        envelope = api.get_envelope(self.account.account_id, envelope_id)
        return envelope
