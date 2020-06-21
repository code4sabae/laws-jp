for xml in `find . -name "*.xml"` ; do
  echo ${xml}
  mv ${xml} '../data/laws/'
done
cd ..
