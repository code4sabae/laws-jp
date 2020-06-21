cd temp
for zip in `find *.zip ` ; do
  echo ${zip}
  unzip ${zip} '*.xml'
done
cd ..
