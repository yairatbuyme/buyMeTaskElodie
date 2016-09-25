<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the Closure to execute when that URI is requested.
|
*/
Route::get('/', 'TasksController@index');
Route::get('/tasks', 'TasksController@index');
Route::get('/tasks/create', 'TasksController@create');
Route::get('/tasks/{id}', 'TasksController@destroy');
Route::resource('tasks', 'TasksController');


Route::get('/db', function(){
	DB::table('tasks')->insert([
  			'name' => 'do',
				'done' => 1,
 ]);

	return DB::table('tasks')->get();
});



?>
