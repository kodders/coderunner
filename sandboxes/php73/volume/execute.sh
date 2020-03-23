#!/bin/bash
cp php.ini /usr/local/etc/php
for i in `ls input*.txt | grep -oE '[0-9]+'`; do
    php $1 < input_$i.txt > user_output_$i.txt
    diff=`diff user_output_$i.txt output_$i.txt`
    if [ ${#diff} -eq 0 ]; then
        echo "true"
    else
        echo "false"
    fi
done