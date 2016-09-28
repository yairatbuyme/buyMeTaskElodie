@extends('layouts.main')
@section('content')

  // pass to client side as Ember template
  {{ link_to_route('tasks.create', '+')}}
	<h2>MyList</h2>

    @foreach ($tasks as $t)
      <div>
        <tr class="success">
      {{ link_to_route('tasks.destroy', 'x', [$t->id]) }}
      {{{ $t->name }}}
      {{ Form::checkbox('done', '1') }}
      </tr>
    </div>
    @endforeach



@stop
