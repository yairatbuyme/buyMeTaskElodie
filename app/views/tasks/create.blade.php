// pass to client side as Ember template

@extends('layouts.main')
@section('content')
    {{ Form::open( array('route' => 'tasks.store') ) }}
    {{ Form::label('name', 'Task name') }}
    {{ Form::text('name') }}
    {{ $errors->first('name', '<small class="error">:message</small>') }}
    {{ Form::submit('update', array('class' => 'button')) }}
    {{ Form::close() }}
@stop
