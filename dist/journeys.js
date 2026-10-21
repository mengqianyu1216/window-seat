// Illustrative journeys. Replace these records with the owner's real travel memories.
export const journeys = [
  {
    id: 'mountain', number: '01', name: '山野来信', english: 'A LETTER FROM THE HILLS',
    place: '山野与湖泊', mood: '想吹风', theme: '山野', scene: 'assets/landscapes/mountain.webp', nightScene: 'assets/landscapes/mountain-night.webp',
    title: '把时间，留在山风里。', short: '有些路，慢慢走才会遇见。',
    caption: '山风很轻，今天也不必着急。', stamp: 'MOUNTAIN DAYS', season: '一个晴朗的夏日',
    introduction: '如果旅行可以有一个暂停键，我想把它按在山脚下。没有必须赶上的日落，也没有下一张要打卡的照片，只有风把湖面吹皱，又慢慢抚平。',
    paragraphs: [
      { title: '沿着湖边，多走了一小段', text: '原本只是想找一个地方坐坐，最后却沿着湖走了很远。路过一座小木屋、一片开着野花的草坡，还有一只始终不肯看镜头的鸟。旅途里那些不在计划上的转弯，常常比目的地更让人喜欢。' },
      { title: '没做什么，也很好', text: '后来在长椅上把带来的面包吃完，听远处偶尔传来的钟声。想留下的不是一个漂亮坐标，而是那种“今天这样就很好”的心情。' }
    ],
    experiences: [ ['沿湖散步', '把地图折起来，给自己留一点走错路的自由。'], ['山间野餐', '一块面包、一杯热茶，就是很好的旅行午餐。'], ['收集风声', '闭上眼睛一分钟，听见照片没有拍到的部分。'] ],
    route: ['小站出发', '湖边步道', '山脚野餐', '晚风返程'], mapPoint: [30, 39]
  },
  {
    id: 'coast', number: '02', name: '海边慢半拍', english: 'SOMEWHERE BY THE SEA',
    place: '海岸与小镇', mood: '想发呆', theme: '海边', scene: 'assets/landscapes/coast.webp', nightScene: 'assets/landscapes/coast-night.webp',
    title: '今天的安排，是看海。', short: '让海风替我，把心事吹远一点。',
    caption: '等一阵海风，也等一场好心情。', stamp: 'SEA YOU SOON', season: '有海风的午后',
    introduction: '离海越来越近的时候，空气先变了。车窗里有了一点蓝色，风里有了一点咸味，连原本走得很快的心，也开始慢下来。',
    paragraphs: [
      { title: '在一条小巷里迷路', text: '顺着晾衣绳的影子走进一条小巷，尽头竟然能看见海。买一杯冰饮，坐在矮墙上等渔船回来。没有发生什么特别的事，阳光却把这一刻照得很亮。' },
      { title: '捡一颗普通的石头', text: '沙滩上的石头很多，我挑了一颗最普通的。它没有特别的形状，也没什么稀奇的颜色，却刚好能提醒我，曾经有一个下午，所有烦恼都很远。' }
    ],
    experiences: [ ['海边发呆', '给浪花一点时间，也给自己一点时间。'], ['小镇漫游', '沿着能闻到面包香的巷子，慢慢往前走。'], ['看船归港', '在太阳还没落下时，等一盏盏灯亮起来。'] ],
    route: ['海边小站', '蓝色小巷', '沙滩拾光', '港口日落'], mapPoint: [67, 62]
  },
  {
    id: 'dusk', number: '03', name: '追一场落日', english: 'UNTIL THE SKY TURNS PINK',
    place: '田野与暮色', mood: '想看日落', theme: '暮色', scene: 'assets/landscapes/dusk.webp', nightScene: 'assets/landscapes/dusk-night.webp',
    title: '赶不上什么，也赶得上晚霞。', short: '把普通的一天，过成粉色。',
    caption: '太阳收工了，温柔还没有。', stamp: 'GOLDEN HOUR', season: '快要入夜的时候',
    introduction: '有时候出门，只是为了看天慢慢变颜色。从金色到橘色，再到一片说不清的粉。站在田边的那几分钟，像收到了一封没有署名的信。',
    paragraphs: [
      { title: '追着光，走到小路尽头', text: '远处村子里亮起第一盏灯，路边的草尖也变成金色。想起很多平时没空想的小事，却一件都不急着解决。只要再看一会儿，再看一会儿就好。' },
      { title: '晚一点，再回去', text: '回程的时候天已经暗下来，车窗映出自己的样子。旅行带回来的东西很轻：几张照片、一点泥土，还有足够照亮接下来几天的心情。' }
    ],
    experiences: [ ['追一场晚霞', '找一个看得到天空的地方，等颜色慢慢发生。'], ['田间骑行', '在风里绕远一点，回家的路也可以很好玩。'], ['村落夜游', '天黑以后，听一听白天没有留意过的声音。'] ],
    route: ['午后出发', '田间小路', '落日长椅', '星光回程'], mapPoint: [46, 74]
  }
];

export const getJourney = id => journeys.find(journey => journey.id === id);
export const getSceneAsset = (journey, night = false) => night ? journey.nightScene : journey.scene;
