import requests
import json
import re

class YouTube:
    def __init__(self, lang='en-US,en;q=0.9'):
    	self.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36 Edg/106.0.1370.37'
    	self.headers = {'accept-language': lang,'user-agent': self.userAgent}
    	self.api = 'https://www.youtube.com'
    	self.clientVersion = '2.20220929.09.00'

    def extendable(self, jsData, resp):
    	token = jsData[-1]['continuationItemRenderer']['continuationEndpoint']['continuationCommand']['token']
    	browseApi = jsData[-1]['continuationItemRenderer']['continuationEndpoint']['commandMetadata']['webCommandMetadata']['apiUrl']
    	key = re.search(r'INNERTUBE_API_KEY":"([^"]+)', resp.text)
    	if key:
    		key = key.group(1)

    	if token and browseApi and key:
	    	params = {'key': key, 'prettyPrint': 'false'}
	    	json_data = {'context': {'client': {'userAgent': self.userAgent, 'clientName': 'WEB',
	                        'clientVersion': self.clientVersion}}, 'continuation': token}

	    	response = requests.post(self.api+browseApi, params=params, headers=self.headers, json=json_data).json()
    
    def extract(self, url):
        params = {'list': re.search(r'list=([A-z0-9-_]+)', requests.utils.unquote(url)).group(1)}

        response = requests.get(self.api+'/playlist', params=params, headers=self.headers)
        if response.status_code == 200:
            JsonData = re.search(r'var.ytInitialData[^{]+(.+);</script>', response.text)
            if JsonData:
                JsonData = json.loads(JsonData.group(1))

        content = JsonData['contents']['twoColumnBrowseResultsRenderer']['tabs'][0]['tabRenderer']['content']['sectionListRenderer']['contents'][0]['itemSectionRenderer']['contents'][0]['playlistVideoListRenderer']['contents']
        Info = {
        	"plname" : JsonData['header']['playlistHeaderRenderer']['title']['simpleText'],
        	'plowner': JsonData['header']['playlistHeaderRenderer']['ownerText']['runs'][0]['text'],
        	"items" : JsonData['header']['playlistHeaderRenderer']['numVideosText']['runs'][0]['text'],
        	"views" : JsonData['header']['playlistHeaderRenderer']['viewCountText']['simpleText']
        }
        print(json.dumps(Info, indent=4))
        if "continuationItemRenderer" in content[-1].keys():
        	pass
        	#self.extendable(content, response)
        self.PlayList = {**Info, **{'contents':[]}}
        for each in content:
            try:
                cnt = {}
                cnt['index'] = int(each['playlistVideoRenderer']['index']['simpleText'])
                cnt['data'] = each['playlistVideoRenderer']['videoId']
                cnt['title'] = each['playlistVideoRenderer']['title']['runs'][0]['text']
                cnt['duration'] = {'time': each['playlistVideoRenderer']['lengthText']['simpleText'], 'inseconds': each['playlistVideoRenderer']['lengthSeconds']}
                self.PlayList['contents'].append(cnt)
            except KeyError:
                pass
        return self.PlayList
