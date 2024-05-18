import base64

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_xml.renderers import XMLRenderer

from django.core.files.base import ContentFile

from .parsers import CustomXMLParser
from profit_pulse.profiles.models import Customer


class DocusignWebhook(APIView):
    """
    This acts as the webhook listener for the Docusign requests
    which comes right after the enrollment document has been signed
    by both parties. This view will save the completed document into
    the `enrollment_contract` field of the :model:`profiles.Customer`
    """

    permission_classes = (AllowAny, )
    parser_classes = (CustomXMLParser, )
    renderer_classes = (XMLRenderer, )

    def sanitize_webhook_data(self, context):
        data = {}
        for key, value in context.items():
            new_key = key.replace('{http://www.docusign.net/API/3.0}', '')
            if isinstance(value, dict):
                value_dict = {}
                for k, v in value.items():
                    new_k = k.replace('{http://www.docusign.net/API/3.0}', '')
                    value_dict[new_k] = v
                data[new_key] = value_dict
            else:
                data[new_key] = value
        return data

    def post(self, request, *args, **kwargs):

        data = self.sanitize_webhook_data(request.data)

        context = {
            'message': 'No PDF uploaded.'
        }
        status_code = status.HTTP_200_OK

        pdf_data = data['DocumentPDFs']['DocumentPDF']
        pdf = self.sanitize_webhook_data(pdf_data)
        if(data['EnvelopeStatus']['Status'] == "Completed"):

            pdf_data = data['DocumentPDFs']['DocumentPDF']
            pdf = self.sanitize_webhook_data(pdf_data)
            if (pdf['DocumentType'] == "CONTENT"):
                filename = 'Completed_{}'.format(pdf['Name'])
                email = data['EnvelopeStatus']['Email']
                customer = Customer.objects.get(user__email=email)
                pdf_file = ContentFile(base64.b64decode(pdf['PDFBytes']))
                customer.enrollment_contract.save(
                    filename,
                    pdf_file,
                    save=True
                )
                pdf_file.close()

                customer.portal_access = True
                customer.save()

                context = {
                    'message': 'PDF uploaded'
                }
                status_code = status.HTTP_201_CREATED

        return Response(context, status=status_code)
