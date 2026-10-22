@extends('layouts.app')
@section('content')
  {{-- a comment --}}
  @foreach ($users as $user)
    <li class="{{ $loop->odd ? 'odd' : 'even' }}">{{ $user->name }}</li>
    @include('partials.card', ['title' => $user->name])
  @empty
    <p>none</p>
  @endforeach
  @if ($a && ! $b)
    ok
  @elseif ($d)
    d
  @endif
  <div>{!! $body !!}</div>
  <x-alert type="error" :message="$message" />
  @php
    $x = strtoupper('a');
  @endphp
  <p>{!! clean($intro) !!}</p>
@endsection
