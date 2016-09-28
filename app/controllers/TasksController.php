<?php

class TasksController extends \BaseController {

	public function __construct() {
		$this->beforeFilter('csrf', array('on' => 'post'));
	}

	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function index()
	{
		$tasks = Task::all();


        return Response::json(array(
            'error' => false,
            'tasks' => $tasks),
            200
        );

	}


	/**
	 * Show the form for creating a new resource.
	 *
	 * @return Response
	 */
	public function create()
	{
		return View::make('tasks.create');
	}


	/**
	 * Store a newly created resource in storage.
	 *
	 * @return Response
	 */
	public function store()
	{
		//validation
		$rules = array(
				'name' => array('required', 'unique:tasks')
		);
		$validator = Validator::make(Input::all(), $rules);
		if ($validator->fails()){
			return Redirect::route('tasks.create')->withErrors($validator)->withInput();
		}


		$name = Input::get('name');
	  $task = new Task();
		$task->name = $name;
		$task->save();
		return Redirect::route('tasks.index')->withMessage('New task was created!');

	}

	/**
	 * Update the specified resource in storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function update($id)
	{
		//
	}


	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function destroy($id)
	{
		  try {
						$task = Task::findOrFail($id)->delete();
						return Redirect::route('tasks.index')->withMessage('Task was deleted!');
	}
	catch(Exception $e){
        // do task when error
        echo $e->getMessage();   // insert query
     }
		//return Redirect::route('tasks.index')->withMessage('Task was deleted!');
	}


}
