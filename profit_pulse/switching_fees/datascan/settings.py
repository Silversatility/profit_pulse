
# Import data for Default Customer if it is not exist in DB
USE_DEFAULT_CUSTOMER_IF_EMPTY = True

# supper admin, ignore if USE_DEFAULT_CUSTOMER_IF_EMPTY = False
DEFAULT_CUSTOMER_USER_ID = 1

# set True if CSV includes header in 1st row
IGNORE_FIRST_ROW = True

CUSTOMER_ALIASES = {
    'Florida Coast Foot & Ankle': 'FLORIDA COAST FOOT AND ANKLE',
    'Georgia Recon Foot & Ankle': 'GEORGIA RECONSTRUCTION FOOT AND ANKLE',
    'Foot & Ankle Spec': 'FOOT & ANKLE SPECIALIST',
    'Foot & Ankle Associates': 'Foot & Ankle Associates of Central Arkansas',
    'Center For Adv Eye Care': 'Center for Advanced Eye Care',
    'ANTHONY G POLITO 2': 'Anthony Polito (Medina)',
}

# 1.  Does 'rx_ins_paid' refer to Insurance Paid?  => Yes
# 2.  Does 'rx_copay' refer to amount paid by Patient?  => Yes
# 3.  Is it correct for us to say Revenue/Total Paid == rx_ins_paid + rx_copay.  => Yes

# Folder template where CSV files are stored in S3, we may separate sub-folder for each day.
#
# - '%Y-%m-%d' => Folder in S3 looks like: 2018-05-10
# - '%Y/%m/%d' => Folder in S3 looks like: 2018/05/10
# - 'csv/%Y-%m-%d' => Folder in S3 looks like: csv/2018-05-10
S3_BUCKET_DATA_SCAN_PREFIX_TEMPLATE = '%Y/%m'

# X minutes period of checking new CSV files in S3
CHECK_S3_BUCKET_IN_MINUTES = 30
