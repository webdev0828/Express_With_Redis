var express = require('express');
var router = express.Router();
const axios = require('axios');

const sortBy = (...attrs) => (a, b) => attrs.length==0 ? 0 : (a[attrs[0]]>b[attrs[0]] ? 1 : a[attrs[0]]<b[attrs[0]] ? -1 : sortBy(...attrs.slice(1))(a, b));

const toArrayMenu = sportsTree => Object.values(sportsTree).map((S, idx) => Object.assign({idx, status:-1}, S, {
  sub: Object.values(S.sub).map((R, idx) => Object.assign({idx, status:-1}, R, {
    sub: Object.values(R.sub).map((T, idx)=>Object.assign({idx, status:-1}, T)).sort(sortBy('id'))
  })).sort(sortBy('id'))
})).sort(sortBy('id'));

async function createSportTree() {
  let sportsTree;
  try {
    const response = await axios.get('https://api-new.harifsport.com/prematch/main?json&l=en');
    sportsTree = Object.entries(response.data.schedules).reduce((T, [name, S]) => Object.assign(T, {
      [S.id]: {
        id: S.id,
        name: name,
        count: S.count,
        order: S.order,
        e_sports:  [18, 28, 32, 44, 47, 146, 26, 16, 145].includes(S.id),
        antepost: S.antepost || false,
        filter_count: S['filter-count'],
        sub: tmp = Object.entries(S.sub).reduce((T, [name, R]) => Object.assign(T, {
          [R.idPal]: {
            id: R.idPal,
            name: name,
            altdesc: R.altdesc? R.altdesc : null, 
            order: R.order || 0,
            sub: tmp = Object.entries(R.sub).reduce((T, [name, t]) => Object.assign(T, {
              [t.idMan]: {
                id: t.idMan,
                order: t.order || 0,
                name: name,
                altdesc: t.altdesc? t.altdesc : null,
                'next-event': (t.mintime || Infinity) * 1000
              }
            }), {}),
            'next-event': Math.min(...Object.values(tmp).map(E => E['next-event']))
          }
        }), {}),
        'next-event': Math.min(...Object.values(tmp).map(E => E['next-event']))
      }
    }
    ), {});
    return toArrayMenu(sportsTree)
  } catch (error) {
    console.error(error);
  }
}

/* GET home page. */
router.get('/', async function(req, res, next) {
  let sportsTree = await createSportTree()
  res.render('index', { title: 'Lite Harifsport', sportTree: sportsTree});
});

module.exports = router;
