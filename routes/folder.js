const router = require('express-promise-router').default();
const graph = require('../graph.js');

// <GetRouteSnippet>
router.get('/',
  async function(req, res) {
    if (!req.session.userId) {
      // Redirect unauthenticated requests to home page
      res.redirect('/');
    } else {
      const params = {
        active: { folder: true }
      };

      //   // Get the user
      //   const user = req.app.locals.users[req.session.userId];
      
      try {
        const directory = await graph.getRootFolder(req.app.locals.msalClient, req.session.userId);
        params.directory = directory.value.map(entry =>{
          const {name, webUrl, lastModifiedDateTime, id, size, createdBy:{user:{displayName, email}}} = entry;
          const downloadUrl = entry['@microsoft.graph.downloadUrl'] || null;
          const timeStamp = new Date(lastModifiedDateTime).toLocaleDateString() + '  ' + new Date(lastModifiedDateTime).toLocaleTimeString();
          return {name: name, webUrl: webUrl, lastModifiedDateTime: timeStamp, id: id, size: (size > 1e9) ? `${(size / 1e9).toFixed(2)} GB` : `${(size / 1024).toFixed(0)} KB` , createdBy: displayName, email: email, downloadUrl: downloadUrl };
        });
        console.log('directory content obtained>', params.directory);
      } catch (err) {
        req.flash('error_msg', {
          message: 'Could not fetch root folder components',
          debug: JSON.stringify(err, Object.getOwnPropertyNames(err))
        });
      }
      res.render('folder', params);
    }
  }
);
// </GetRouteSnippet>

router.get('/getPermissions', async function (req, res){
  console.log('entered getPermisssions>', req.query);
  let permissionsRaw = await graph.getPermissions(req.app.locals.msalClient, req.session.userId, req.query.id);
  console.log('permissions>',JSON.stringify(permissionsRaw));
  let permissions = [];
  permissionsRaw.value.map(entry =>{
    let temp = {
      role: entry.roles[0]
    };
    console.log('entry>', entry);
    if(entry.grantedToIdentities && entry.grantedToIdentities.length){//if length>1 handle. This is for write and read permisssion
      temp.name = entry.grantedToIdentities[0].user.displayName;
      temp.email = entry.grantedToIdentities[0].user.email;
      permissions.push(temp);
    }else if(entry.grantedTo){
      console.log('entered owner case');
      temp.name = entry.grantedTo.user.displayName;
      temp.email = entry.grantedTo.user.email;
      permissions.push(temp);
    }
  });
  console.log('permisssions after parsing>', JSON.stringify(permissions));
  if(permissions && permissions.length) res.status(200).send({permissions: permissions});
  else res.status(500).send('Internal Server Error');
});

router.get('/:folderId',
  async function(req, res) {
    console.log('entered dynamic path>', req.params);//https://graph.microsoft.com/v1.0/drive/items/C44CE7AEFC43BDF4!104/children
    if (!req.session.userId) {
      // Redirect unauthenticated requests to home page
      res.redirect('/');
    } else {
      const params = {
        active: { folder: true }
      };

      const {folderId} = req.params;
      const directory = await graph.getFolderData(req.app.locals.msalClient, req.session.userId, folderId);
      params.directory = directory.value.map(entry =>{
        const {name, webUrl, lastModifiedDateTime, id, size, createdBy:{user:{displayName, email}}} = entry;
        const downloadUrl = entry['@microsoft.graph.downloadUrl'] || null;
        const timeStamp = new Date(lastModifiedDateTime).toLocaleDateString() + '  ' + new Date(lastModifiedDateTime).toLocaleTimeString();
        return {name: name, webUrl: webUrl, lastModifiedDateTime: timeStamp, id: id, size: (size > 1e9) ? `${(size / 1e9).toFixed(2)} GB` : `${(size / 1024).toFixed(0)} KB` , createdBy: displayName, email: email, downloadUrl: downloadUrl };
      });
      
      console.log('Folder data obtained>>', params.directory);
      res.render('folder', params);

    }
  }
);


module.exports = router;