def get_upload_path(obj, filename):
    """
    Returns a dynamic value for the upload_to parameter
    in models.FileField
    """
    context = {
        'app_label': obj._meta.app_label,
        'model_name': obj._meta.model_name,
        'filename': filename
    }
    return "uploads/{app_label}/{model_name}/{filename}".format(**context)
