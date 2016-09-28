<!doctype html>
<html class="no-js" lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Laravel | Welcome</title>

    <link rel="stylesheet" href="<?php echo URL::asset('css/bootstrap.css'); ?>">
    <link rel="stylesheet" href="<?php echo URL::asset('css/bootstrap.min.css'); ?>">
    <link rel="stylesheet" href="<?php echo URL::asset('css/bootstrap-theme.css'); ?>">
    <link rel="stylesheet" href="<?php echo URL::asset('css/bootstrap-theme.min.css'); ?>">
    <link rel="stylesheet" href="<?php echo URL::asset('css/styles.css'); ?>">


</head>

<body>


<script src="js/libs/jquery-1.11.2.min.js"></script>
<script src="js/libs/handlebars-v1.3.0.js"></script>
<script src="js/libs/ember.js"></script>
<script src="js/libs/ember-data.js"></script>
<script src="js/app.js"></script>
<script src="js/templates.js"></script>
<script src="http://builds.emberjs.com/tags/v1.10.0/ember-template-compiler.js"></script>
<script src="http://builds.emberjs.com/tags/v1.10.0/ember.debug.js"></script>



<script type="text/x-handlebars"  id="tasks">
    <h1>Tasks</h1>
    <ul>
        {{#each task in tasks}}

        <li>
            {{task.id}} - {{task.name}}
        </li>

        {{/each}}
    </ul>
    <div>total tasks {{total}}</div>
</script>




</body>


</html>
