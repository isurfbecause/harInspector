function filterAsset(report, contentType) {
  var hash = {};
  var domains = report.log.entries
    .filter(function(item) {
      return item._contentType && ~item._contentType.indexOf(contentType) && item.pageref === 'page_1_0';
    })
    .map(function(item) {
      ['www.',
       'api.',
       'assets.',
       'bh.'
      ].map(function(str) {
          item._host = item._host.replace(str, '');
        });
      return{
        _host : item._host,
        _bytesIn: (+item._bytesIn) / 1000,
        _url: item._url
      };
    })
    .sort(function(a,b) {
      return a._host[0] === b._host[0] ? 0 : (a._host[0] > b._host[0] ? 1 : -1);
    })
    .reduce(function(prev, cur) {
      if (!hash[cur._host]) {
        hash[cur._host] = true;
        prev.push({
          host: cur._host,
          urls: [{
            url: cur._url,
            size: cur._bytesIn
          }]
        });
      } else {
        prev
          .filter(function(filterPrev) {
            return filterPrev.host === cur._host;
          })[0]
            .urls.push({
              url: cur._url,
              size: cur._bytesIn
            });
      }
      return prev;
    },[])
    .map(function(item) {
      return {
        host: item.host,
        urls: item.urls
                .sort(function(a,b) {
                  return (a.size === b.size) ? 0 : (a.size > b.size ? -1 : 1);
                }),
        size: item.urls
                .reduce(function(prev, cur) {
                  return prev + cur.size;
                }, 0)
      };
    })
    .sort(function(a,b) {
      return (a.size === b.size) ? 0 : (a.size > b.size ? -1 : 1);
    });

  var totalSize =
    domains
      .reduce(function(prev, cur) {
        return prev + cur.size;
      }, 0);

  return {
    domains: domains,
    totalSize: + (+totalSize.toFixed(2))
  };
}