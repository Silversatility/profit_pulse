#!/bin/bash
#
# Save a couple o minutes generating the boilerplate for the standup reports
#
# The script requires User/Name (or part of it) that you use in your git commits
# and will collect all commits since yesterday midnight
#
# 2017-10-10T10:15:38 Maxi
usage(){
	echo "Usage: $0 your_git_username [number_of_days]"
}

[[ $# -eq 0 ]] && usage && exit 1

TIMEPOINT='yesterday.midnight'
DATE_FORMAT='%H:%M:%S'

re='^[0-9]+$'
if [[ ! -z "$2" ]]; then
    if [[ "$2" =~ $re ]]; then
      TIMEPOINT="$2 days" &&
      DATE_FORMAT='%d %b %H:%M:%S'
    else
      usage && echo -e "\nERROR: number_of_days is not a number" && exit 1
    fi
fi


echo -e "REPORT SINCE: $TIMEPOINT"
#echo '```'
echo "$(date +%m.%d.%Y) - $1"

#echo -e "\nCOMMITS:"
git log --all --branches --author=$1 --pretty=format:"* %cd %h - %s" --date=format:"$DATE_FORMAT" --no-merges --reverse --since="$TIMEPOINT"

# deprecated by alicebot
#echo -e "\nDONE:"
#echo "*"
## TODO: Interface with JIRA?
#
#echo -e "\nPLANNED_TODAY:"
#echo "*"
#
#echo -e "\nROADBLOCKS:"
#echo "* None"
#echo '```'
#echo -e "└─────────────────────────────── TO HERE (backticks too)\n"
