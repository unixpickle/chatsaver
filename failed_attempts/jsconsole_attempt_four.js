// messages[user_ids][1331871570][offset]=41&messages[user_ids][1331871570][timestamp]=1437664190600&messages[user_ids][1331871570][limit]=40&&client=web_messenger&__user=1645882031&__a=1&__dyn=7AmajEyl35zZ29Q9UoHaEWC5ECiHxO4oyGhVoyeqrWU8popyUWdwIhEoyUnwPUS2O58kUgx-y28S7EC4U-8KuEOq6oS&__req=k&fb_dtsg=AQENGBIz_Dqx&ttstamp=2658169787166731229568113120&__rev=1849663

var req = new XMLHttpRequest();
req.open('POST', '/ajax/mercury/thread_info.php', false);
req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
req.send('messages[user_ids][1331871570][offset]=0&messages[user_ids][1331871570][timestamp]=0&messages[user_ids][1331871570][limit]=10000&&client=web_messenger&__user=1645882031&__a=1&__dyn=7AmajEyl35zZ29Q9UoHaEWC5ECiHxO4oyGhVoyeqrWU8popyUWdwIhEoyUnwPUS2O58kUgx-y28S7EC4U-8KuEOq6oS&__req=k&fb_dtsg=AQENGBIz_Dqx&ttstamp=2658169787166731229568113120&__rev=1849663');
console.log('response is', req.response.length, 'bytes');